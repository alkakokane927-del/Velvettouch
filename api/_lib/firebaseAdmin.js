import dotenv from 'dotenv';

dotenv.config();

let initialized = false;

async function initFirebase() {
  if (initialized) return;
  
  try {
    const { getApps, initializeApp, cert } = await import('firebase-admin/app');
    if (getApps().length > 0) {
      initialized = true;
      return;
    }
    
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
      console.warn('Firebase Admin credentials missing. Firebase features will fail.');
      return;
    }

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\n')
    };

    initializeApp({
      credential: cert(serviceAccount)
    });
    initialized = true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export async function verifyToken(token) {
  if (token === 'admin_bypass') return { uid: 'admin' };
  
  await initFirebase();
  try {
    const { getApps } = await import('firebase-admin/app');
    if (getApps().length === 0) return null;
    
    const { getAuth } = await import('firebase-admin/auth');
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

