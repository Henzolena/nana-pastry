// Firebase configuration and service initialization
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getFunctions, type Functions } from "firebase/functions";

// For debugging
console.log("Firebase config:", {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 5) + '...',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase with error handling
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;

try {
  // Check if config has required values
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error("Missing Firebase configuration values");
  }
  
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase services one by one with error handling
  try {
    auth = getAuth(app);
    console.log("Firebase Auth initialized successfully");
  } catch (authError) {
    console.error("Error initializing Firebase Auth:", authError);
    auth = {} as Auth;
  }
  
  try {
    db = getFirestore(app);
    console.log("Firebase Firestore initialized successfully");
  } catch (dbError) {
    console.error("Error initializing Firestore:", dbError);
    db = {} as Firestore;
  }
  
  try {
    storage = getStorage(app);
    console.log("Firebase Storage initialized successfully");
  } catch (storageError) {
    console.error("Error initializing Storage:", storageError);
    storage = {} as FirebaseStorage;
  }
  
  try {
    functions = getFunctions(app);
    console.log("Firebase Functions initialized successfully");
  } catch (functionsError) {
    console.error("Error initializing Functions:", functionsError);
    functions = {} as Functions;
  }
  
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  
  // Create mock implementations for development without Firebase
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
  functions = {} as Functions;
}

// Export the Firebase services for use in other files
export { app, auth, db, storage, functions };

// Helper function to check if we're in a production environment
export const isProduction = process.env.NODE_ENV === 'production';

// Helper function to check if we're in a development environment
export const isDevelopment = process.env.NODE_ENV === 'development';

// Helper function to check if we're in a development environment (Vite specific)
export const isViteDevelopment = import.meta.env.DEV; 