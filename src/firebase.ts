import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut as fbSignOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence');
  }
});

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

// Customize provider prompts or scopes if needed
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async () => {
  try {
    // Attempt standard popup sign-in
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    
    // Check if error is due to popup blocker or matching redirect constraints
    const isPopupBlocked = 
      error.code === 'auth/popup-blocked' || 
      error.message?.includes('popup') || 
      error.message?.includes('closed-by-user');

    if (isPopupBlocked) {
      console.warn('Popup blocked, retrying with redirect...');
      alert('Your browser blocked the login popup. Redirecting you to Google logon instead...');
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectError: any) {
        console.error('Error with redirect sign-in:', redirectError);
        alert('Authentication failed: ' + (redirectError.message || redirectError));
      }
    } else {
      alert(
        'Login failed: ' + (error.message || 'Unknown error') + '\n\n' +
        'If you are hosting on Vercel, please ensure:\n' +
        '1. "comparstar.vercel.app" is added to your Firebase Auth -> Settings -> Authorized Domains.\n' +
        '2. Try the "Sign in with redirect" option in Settings.'
      );
    }
  }
};

export const signInWithGoogleRedirect = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error('Redirect sign in error:', error);
    alert('Redirect sign in failed: ' + error.message);
  }
};

export const signOut = async () => {
  await fbSignOut(auth);
};

// Validate connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
