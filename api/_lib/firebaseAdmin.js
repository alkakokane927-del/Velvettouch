import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines from environment variable
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const verifyToken = async (token) => {
  if (!token) return null;
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying auth token', error);
    return null;
  }
};

export default getAuth;
