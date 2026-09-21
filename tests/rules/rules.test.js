// Emulator-backed tests for firestore.rules and storage.rules — the Firebase
// equivalent of verifying the old Postgres RLS policies directly. Each test acts
// as one identity (public, admin, active member, inactive member, an unverified
// account claiming a member's email) and asserts what the rules allow it to do.
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { deleteObject, getBytes, ref, uploadBytes } from 'firebase/storage';
import { ADMIN_EMAIL } from '../../src/lib/constants.js';

const MEMBER = 'jamie@example.com';
const FORMER_MEMBER = 'former@example.com';
const IMAGE = new Uint8Array([137, 80, 78, 71]);
const BUCKET = 'gs://demo-heartland-fermenters-guild.appspot.com';

let env;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-heartland-fermenters-guild',
    firestore: { host: '127.0.0.1', port: 8180, rules: readFileSync('firestore.rules', 'utf8') },
    storage: { host: '127.0.0.1', port: 9199, rules: readFileSync('storage.rules', 'utf8') },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.clearStorage();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const created_at = Timestamp.fromDate(new Date('2026-08-20T00:00:00Z'));
    await setDoc(doc(db, 'active_members', MEMBER), { active: true, created_at });
    await setDoc(doc(db, 'active_members', FORMER_MEMBER), { active: false, created_at });
    for (const status of ['published', 'pending', 'deactivated']) {
      await setDoc(doc(db, 'recipes', status), { title: status, status, created_at });
    }
    await uploadBytes(ref(context.storage(BUCKET), 'recipe-photos/existing.png'), IMAGE, { contentType: 'image/png' });
  });
});

const publicUser = () => env.unauthenticatedContext();
const admin = () => env.authenticatedContext('admin-uid', { email: ADMIN_EMAIL });
const member = (email = MEMBER) => env.authenticatedContext(`uid-${email}`, { email, email_verified: true });
// Anyone can create an email/password account for any address — unverified.
const impostor = () => env.authenticatedContext('impostor-uid', { email: MEMBER, email_verified: false });

function newRecipe(status, extra = {}) {
  return {
    title: 'New',
    category: 'Beer',
    summary: '',
    ingredients: 'Malt',
    instructions: 'Brew.',
    status,
    created_at: serverTimestamp(),
    ...extra,
  };
}

describe('recipes — reads', () => {
  test('the public can read a published recipe, but not a pending or deactivated one', async () => {
    const db = publicUser().firestore();
    await assertSucceeds(getDoc(doc(db, 'recipes', 'published')));
    await assertFails(getDoc(doc(db, 'recipes', 'pending')));
    await assertFails(getDoc(doc(db, 'recipes', 'deactivated')));
  });

  test('anyone can confirm a slug is unused (reading a missing document)', async () => {
    await assertSucceeds(getDoc(doc(publicUser().firestore(), 'recipes', 'no-such-recipe')));
  });

  test('a public list query must itself filter to published recipes', async () => {
    const recipes = collection(publicUser().firestore(), 'recipes');
    await assertSucceeds(getDocs(query(recipes, where('status', '==', 'published'))));
    await assertFails(getDocs(recipes));
    await assertFails(getDocs(query(recipes, where('status', '==', 'pending'))));
  });

  test('a member reads no more than the public does', async () => {
    const db = member().firestore();
    await assertFails(getDoc(doc(db, 'recipes', 'pending')));
    await assertFails(getDocs(collection(db, 'recipes')));
  });

  test('admin can read and list every status', async () => {
    const db = admin().firestore();
    await assertSucceeds(getDoc(doc(db, 'recipes', 'pending')));
    await assertSucceeds(getDocs(collection(db, 'recipes')));
  });
});

describe('recipes — writes', () => {
  test('the public cannot create a recipe', async () => {
    await assertFails(setDoc(doc(publicUser().firestore(), 'recipes', 'x'), newRecipe('pending')));
  });

  test('an active member can create a recipe only as pending', async () => {
    const db = member().firestore();
    await assertSucceeds(setDoc(doc(db, 'recipes', 'mine'), newRecipe('pending')));
    await assertFails(setDoc(doc(db, 'recipes', 'sneaky'), newRecipe('published')));
  });

  test('a member cannot overwrite an existing recipe by reusing its slug', async () => {
    await assertFails(setDoc(doc(member().firestore(), 'recipes', 'published'), newRecipe('pending')));
  });

  test('a member cannot add fields outside the recipe schema, or backdate created_at', async () => {
    const db = member().firestore();
    await assertFails(setDoc(doc(db, 'recipes', 'a'), newRecipe('pending', { featured: true })));
    await assertFails(
      setDoc(doc(db, 'recipes', 'b'), newRecipe('pending', { created_at: Timestamp.fromDate(new Date('2020-01-01')) })),
    );
  });

  test('a deactivated member, or an unverified account using a member\'s email, cannot create', async () => {
    await assertFails(setDoc(doc(member(FORMER_MEMBER).firestore(), 'recipes', 'a'), newRecipe('pending')));
    await assertFails(setDoc(doc(impostor().firestore(), 'recipes', 'b'), newRecipe('pending')));
  });

  test('a member cannot update or delete any recipe, including approving one', async () => {
    const db = member().firestore();
    await assertFails(updateDoc(doc(db, 'recipes', 'published'), { title: 'Hijacked' }));
    await assertFails(deleteDoc(doc(db, 'recipes', 'published')));
  });

  test('admin can create with any valid status, update, and delete', async () => {
    const db = admin().firestore();
    await assertSucceeds(setDoc(doc(db, 'recipes', 'new'), newRecipe('published')));
    await assertFails(setDoc(doc(db, 'recipes', 'bad'), newRecipe('archived')));
    await assertSucceeds(updateDoc(doc(db, 'recipes', 'pending'), { status: 'published' }));
    await assertFails(updateDoc(doc(db, 'recipes', 'pending'), { status: 'archived' }));
    await assertSucceeds(deleteDoc(doc(db, 'recipes', 'deactivated')));
  });
});

describe('active_members', () => {
  test('only admin can read or write the roster', async () => {
    await assertSucceeds(getDocs(collection(admin().firestore(), 'active_members')));
    await assertSucceeds(setDoc(doc(admin().firestore(), 'active_members', 'new@example.com'), { active: true }));

    await assertFails(getDoc(doc(member().firestore(), 'active_members', MEMBER)));
    await assertFails(setDoc(doc(member().firestore(), 'active_members', 'friend@example.com'), { active: true }));
    await assertFails(getDocs(collection(publicUser().firestore(), 'active_members')));
  });

  test('roster entries only hold name, phone, active, and created_at', async () => {
    const db = admin().firestore();
    await assertSucceeds(
      setDoc(doc(db, 'active_members', 'sam@example.com'), {
        name: 'Sam Lee',
        phone: null,
        active: true,
        created_at: serverTimestamp(),
      }),
    );
    await assertFails(setDoc(doc(db, 'active_members', 'x@example.com'), { active: true, role: 'admin' }));
    await assertFails(setDoc(doc(db, 'active_members', 'y@example.com'), { active: 'yes' }));
  });
});

describe('recipe photos (Storage)', () => {
  const upload = (context, name, contentType = 'image/png') =>
    uploadBytes(ref(context.storage(BUCKET), `recipe-photos/${name}`), IMAGE, { contentType });

  test('anyone can view a photo', async () => {
    await assertSucceeds(getBytes(ref(publicUser().storage(BUCKET), 'recipe-photos/existing.png')));
  });

  test('admin and active members can upload images; nobody else can', async () => {
    await assertSucceeds(upload(admin(), 'a.png'));
    await assertSucceeds(upload(member(), 'b.png'));
    await assertFails(upload(publicUser(), 'c.png'));
    await assertFails(upload(member(FORMER_MEMBER), 'd.png'));
    await assertFails(upload(impostor(), 'e.png'));
  });

  test('only JPG, PNG, and WebP are accepted, even for admin', async () => {
    await assertSucceeds(upload(admin(), 'ok.jpg', 'image/jpeg'));
    await assertSucceeds(upload(admin(), 'ok.webp', 'image/webp'));
    await assertFails(upload(admin(), 'f.txt', 'text/plain'));
    await assertFails(upload(admin(), 'g.heic', 'image/heic'));
    await assertFails(upload(admin(), 'h.gif', 'image/gif'));
  });

  test('uploads over 10 MB are refused', async () => {
    const big = new Uint8Array(10 * 1024 * 1024 + 1);
    await assertSucceeds(
      uploadBytes(ref(admin().storage(BUCKET), 'recipe-photos/limit.png'), new Uint8Array(10 * 1024 * 1024), {
        contentType: 'image/png',
      }),
    );
    await assertFails(
      uploadBytes(ref(admin().storage(BUCKET), 'recipe-photos/big.png'), big, { contentType: 'image/png' }),
    );
  });

  test('only admin can delete a photo', async () => {
    await assertFails(deleteObject(ref(member().storage(BUCKET), 'recipe-photos/existing.png')));
    await assertSucceeds(deleteObject(ref(admin().storage(BUCKET), 'recipe-photos/existing.png')));
  });
});
