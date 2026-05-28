import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut as fbSignOut, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence');
  }
});

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(console.warn);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in with Google Popup (works in both browser and Electron)
 * In Electron: opens a modal auth window via IPC + signInWithRedirect
 * In Browser: uses signInWithPopup directly
 */
export const signInWithGooglePopup = async () => {
  try {
    localStorage.setItem('activeTab', 'settings');
    localStorage.removeItem('electron:auth:completed');

    if ((window as any).electronAPI?.signInWithGoogle) {
      // Electron: use IPC to open auth window
      localStorage.setItem('electron:auth:initiated', 'true');
      const authPromise = (window as any).electronAPI.signInWithGoogle();
      await signInWithRedirect(auth, googleProvider);
      const result = await authPromise;
      if (result?.success) {
        window.location.reload();
      }
    } else {
      // Browser: use popup directly
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        localStorage.setItem('electron:auth:completed', Date.now().toString());
        window.location.reload();
      }
    }
  } catch (error: any) {
    alert('Sign in failed: ' + (error.message || error));
  }
};

/**
 * Sign in with Google — uses popup in browser, redirect flow in Electron.
 * This is the canonical sign-in function for all environments.
 */
export const signInWithGoogleRedirect = async () => {
  try {
    if ((window as any).electronAPI?.signInWithGoogle) {
      // Electron: use IPC + redirect flow
      const authPromise = (window as any).electronAPI.signInWithGoogle();
      await signInWithRedirect(auth, googleProvider);
      const result = await authPromise;
      if (result?.success) {
        window.location.reload();
      }
    } else {
      // Browser: use popup — no page navigation, no reload loop
      await signInWithPopup(auth, googleProvider);
    }
  } catch (error: any) {
    if ((error as any)?.code !== 'auth/popup-closed-by-user') {
      alert('Sign in failed: ' + (error.message || error));
    }
  }
};

export const signOut = async () => {
  await fbSignOut(auth);
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    console.log('[Auth] getRedirectResult:', result ? result.user?.email : 'null');
    if (result?.user) {
      localStorage.setItem('electron:auth:completed', Date.now().toString());
    }
    return result?.user || null;
  } catch (error) {
    console.error('[Auth] getRedirectResult error:', error);
    return null;
  }
};
