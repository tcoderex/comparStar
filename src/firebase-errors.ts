import { auth } from './firebase';

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  } | null;
}

export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null) {
  if (error?.message?.includes('Missing or insufficient permissions') || error?.code === 'permission-denied') {
    const currentUser = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: currentUser ? {
        userId: currentUser.uid,
        email: currentUser.email || '',
        emailVerified: currentUser.emailVerified,
        isAnonymous: currentUser.isAnonymous,
        providerInfo: currentUser.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || ''
        }))
      } : null
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}
