import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth, GoogleAuthProvider } from 'firebase/auth';
import type { FirebaseConfigState } from '../types';

const STORAGE_KEY_FIREBASE = 'poemnd_firebase_config';

export const ND_LABS_FIREBASE_CONFIG: FirebaseConfigState = {
  apiKey: "AIzaSyC6h0Uqg34PiT0p9l_cQOT7p7pt6kVHCHk",
  authDomain: "ndlabs-0.firebaseapp.com",
  projectId: "ndlabs-0",
  storageBucket: "ndlabs-0.firebasestorage.app",
  messagingSenderId: "600040258053",
  appId: "1:600040258053:web:617a19f62aafeb35d13a6c"
};

export function getStoredFirebaseConfig(): FirebaseConfigState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIREBASE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored firebase config', e);
  }

  // Use ND Labs global config if available
  if (typeof window !== 'undefined') {
    const wConfig = (window as any).EDU_CONFIG;
    if (wConfig && wConfig.firebaseApiKey) {
      return {
        apiKey: wConfig.firebaseApiKey,
        authDomain: wConfig.firebaseAuthDomain || ND_LABS_FIREBASE_CONFIG.authDomain,
        projectId: wConfig.firebaseProjectId || ND_LABS_FIREBASE_CONFIG.projectId,
        storageBucket: wConfig.firebaseStorageBucket || ND_LABS_FIREBASE_CONFIG.storageBucket,
        messagingSenderId: wConfig.firebaseMessagingSenderId || ND_LABS_FIREBASE_CONFIG.messagingSenderId,
        appId: wConfig.firebaseAppId || ND_LABS_FIREBASE_CONFIG.appId,
      };
    }
  }

  // Fallback to Vite env variables
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || ND_LABS_FIREBASE_CONFIG.authDomain,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || ND_LABS_FIREBASE_CONFIG.storageBucket,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ND_LABS_FIREBASE_CONFIG.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ND_LABS_FIREBASE_CONFIG.appId,
    };
  }

  return ND_LABS_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: FirebaseConfigState): void {
  localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(config));
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export function initFirebase(customConfig?: FirebaseConfigState): { 
  app: FirebaseApp | null; 
  db: Firestore | null; 
  auth: Auth | null; 
  isLive: boolean 
} {
  const config = customConfig || getStoredFirebaseConfig();

  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, db: null, auth: null, isLive: false };
  }

  try {
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    auth = getAuth(app);
    return { app, db, auth, isLive: true };
  } catch (err) {
    console.warn('Firebase initialization error, falling back to local mode:', err);
    return { app: null, db: null, auth: null, isLive: false };
  }
}

// Auto init on module load
initFirebase();
export { app, db, auth };
export const isLiveFirebase = () => Boolean(db && auth);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firebase Auth Wrappers
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  type User as FirebaseUser 
} from 'firebase/auth';

export async function signInWithGoogleAuth(): Promise<FirebaseUser> {
  if (!auth) {
    throw new Error('Firebase Auth chưa được khởi tạo. Vui lòng cấu hình Firebase trong phần Cài đặt.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signInWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  if (!auth) {
    throw new Error('Firebase Auth chưa được khởi tạo. Vui lòng cấu hình Firebase trong phần Cài đặt.');
  }
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return result.user;
}

export async function signUpWithEmail(
  email: string, 
  pass: string, 
  displayName: string
): Promise<FirebaseUser> {
  if (!auth) {
    throw new Error('Firebase Auth chưa được khởi tạo. Vui lòng cấu hình Firebase trong phần Cài đặt.');
  }
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName.trim()) {
    await updateProfile(result.user, {
      displayName: displayName.trim()
    });
  }
  return result.user;
}

export async function signOutFirebase(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
