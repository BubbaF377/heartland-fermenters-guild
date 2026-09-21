// Shared Firebase app + the Firestore/Auth/Storage helpers used by the recipes,
// admin, and submit pages' client-side scripts only (never imported from Astro
// frontmatter — see constants.js for why).
//
// The web config below is safe to expose to the browser by design — it only
// identifies the project. Real protection comes from firestore.rules and
// storage.rules, not from keeping any of these values secret. See README.md for
// where to copy them from in the Firebase console.
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { connectStorageEmulator, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { RECIPE_PHOTOS_PATH } from './constants.js';

// From Firebase console → Project settings → General → Your apps → Web app.
const PRODUCTION_CONFIG = {
  apiKey: 'AIzaSyB8XORONI_ntUCXLcDgnDrRi2iQSLTi2qA',
  authDomain: 'heartland-fermenters-guild.firebaseapp.com',
  projectId: 'heartland-fermenters-guild',
  storageBucket: 'heartland-fermenters-guild.firebasestorage.app',
  messagingSenderId: '751191420385',
  appId: '1:751191420385:web:3a092bed544b41399db6a0',
  measurementId: 'G-RHVKZWQL66',
};

// Set at build time (Playwright's webServer, or `npm run dev:emulators`) to point
// every page at the Firebase Local Emulator Suite instead of the real project. A
// `demo-` project ID tells the emulators there's no real project behind it at all.
const USE_EMULATORS = import.meta.env.PUBLIC_FIREBASE_EMULATORS === 'true';
export const EMULATOR_PROJECT_ID = 'demo-heartland-fermenters-guild';

const app = initializeApp(
  USE_EMULATORS
    ? {
        apiKey: 'demo-api-key',
        authDomain: `${EMULATOR_PROJECT_ID}.firebaseapp.com`,
        projectId: EMULATOR_PROJECT_ID,
        storageBucket: `${EMULATOR_PROJECT_ID}.appspot.com`,
      }
    : PRODUCTION_CONFIG,
);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

if (USE_EMULATORS) {
  connectFirestoreEmulator(db, '127.0.0.1', 8180);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}

// Firestore hands back the document ID separately from its fields, and created_at
// as a Timestamp — this flattens a snapshot into the plain object shape the pages
// render from (slug = document ID, created_at = a Date).
export function recipeFromSnap(snap) {
  const data = snap.data();
  return {
    ...data,
    slug: snap.id,
    created_at: data.created_at?.toDate?.() ?? new Date(),
  };
}

// Storage download URLs have to be fetched (unlike Supabase's getPublicUrl, which
// was a pure string build), so callers set the <img> src once this resolves.
export function photoDownloadUrl(photoPath) {
  return getDownloadURL(ref(storage, `${RECIPE_PHOTOS_PATH}/${photoPath}`));
}

export function setPhotoSrc(img, photoPath) {
  photoDownloadUrl(photoPath)
    .then((url) => {
      img.src = url;
    })
    .catch(() => {
      img.closest('.card-thumb, .recipe-row-thumb')?.remove();
    });
}

// Uploads a chosen photo file, named from the recipe's slug so it's traceable, and
// returns the stored path (relative to recipe-photos/). Throws on failure — the
// caller decides how to surface that (both admin and the submission form treat a
// failed upload as "don't save the recipe," rather than saving one with a broken
// photo reference).
export async function uploadRecipePhoto(photoFile, slug) {
  const ext = photoFile.name.includes('.') ? photoFile.name.split('.').pop() : 'jpg';
  const photoPath = `${slug}-${Date.now()}.${ext}`;
  await uploadBytes(ref(storage, `${RECIPE_PHOTOS_PATH}/${photoPath}`), photoFile, {
    contentType: photoFile.type || 'image/jpeg',
  });
  return photoPath;
}

// Creates a recipe document whose ID is its slug, trying title, title-2, title-3,
// ... until a free one is found. Each attempt is a transaction (read, then create
// only if absent), so two submissions racing for the same slug can't overwrite each
// other — a plain setDoc() would silently replace an existing recipe for admin.
//
// A read that's denied means the slug exists but isn't published (a member's
// session can only read published recipes, or confirm a slug is unused) — treated
// as "taken," the same as a slug that visibly exists. Returns the slug used.
export async function createRecipeWithUniqueSlug(baseSlug, fields) {
  for (let attempt = 0; attempt < 25; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const recipeRef = doc(db, 'recipes', slug);

    const created = await runTransaction(db, async (tx) => {
      let snap;
      try {
        snap = await tx.get(recipeRef);
      } catch (err) {
        if (err?.code === 'permission-denied') return false;
        throw err;
      }
      if (snap.exists()) return false;
      tx.set(recipeRef, { ...fields, created_at: serverTimestamp() });
      return true;
    });

    if (created) return slug;
  }
  throw new Error('Could not find an available slug — too many recipes with a similar title.');
}
