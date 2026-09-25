// The bare Firebase app, with no Firestore/Auth/Storage clients attached. Split out
// of firebase.js so a page that only needs one Firebase product (the Resources
// page's AI search) doesn't pull in and initialize all the others.
//
// The web config below is safe to expose to the browser by design — it only
// identifies the project. Real protection comes from firestore.rules and
// storage.rules (and App Check, for AI Logic), not from keeping any of these
// values secret. See README.md for where to copy them from in the Firebase console.
import { initializeApp } from 'firebase/app';

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
export const USE_EMULATORS = import.meta.env.PUBLIC_FIREBASE_EMULATORS === 'true';
export const EMULATOR_PROJECT_ID = 'demo-heartland-fermenters-guild';

export const app = initializeApp(
  USE_EMULATORS
    ? {
        apiKey: 'demo-api-key',
        authDomain: `${EMULATOR_PROJECT_ID}.firebaseapp.com`,
        projectId: EMULATOR_PROJECT_ID,
        storageBucket: `${EMULATOR_PROJECT_ID}.appspot.com`,
        // AI Logic refuses to build a request without an appId; the emulators
        // don't care what it is.
        appId: '1:000000000000:web:demo',
      }
    : PRODUCTION_CONFIG,
);
