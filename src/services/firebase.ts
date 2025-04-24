import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if environment variables are properly loaded
const validateConfig = () => {
  const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID'
  ];
  
  const missingKeys = requiredKeys.filter(key => !import.meta.env[key]);
  
  if (missingKeys.length > 0) {
    console.error(`Missing required Firebase configuration: ${missingKeys.join(', ')}`);
    console.error('Make sure your .env file is properly configured with the required Firebase values.');
    return false;
  }
  
  return true;
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

try {
  if (validateConfig()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('Firebase initialized successfully');
  } else {
    console.error('Firebase initialization skipped due to missing configuration');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export const functions = getFunctions(app);

// Helper function to check if we're in development environment
export const isDevelopment = import.meta.env.DEV;

// Initialize emulators if in development
if (isDevelopment) {
  // Uncomment these when you set up local emulators
  // import { connectAuthEmulator } from 'firebase/auth';
  // import { connectFirestoreEmulator } from 'firebase/firestore';
  // import { connectStorageEmulator } from 'firebase/storage';
  // import { connectFunctionsEmulator } from 'firebase/functions';
  // 
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, 'localhost', 9199);
  // connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { app, auth, db, storage }; 