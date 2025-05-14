/**
 * Firebase Configuration and Service Initialization
 * 
 * This module securely initializes Firebase services using environment variables
 * and provides error handling, fallbacks, and proper type safety.
 */
import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, type Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, type FirebaseStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, type Functions, connectFunctionsEmulator } from "firebase/functions";
import { getAnalytics, type Analytics, isSupported } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
// Use any for performance type to avoid compatibility issues between packages
type Performance = any;

/**
 * Safely access environment variables (works both in Vite and Node.js environments)
 */
const getEnv = (key: string, defaultValue: string = ''): string => {
  // Check if running in Vite context
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || process.env[key] || defaultValue;
  }
  // Fallback to Node.js environment variables
  return process.env[key] || defaultValue;
};

const getBoolEnv = (key: string, defaultValue: boolean = false): boolean => {
  const value = getEnv(key, String(defaultValue));
  return value === 'true' || value === '1' || value === 'yes';
};

/**
 * Environment detection helpers
 */
export const isProduction = process.env.NODE_ENV === 'production' || getEnv('VITE_APP_ENVIRONMENT') === 'production';
export const isStaging = getEnv('VITE_APP_ENVIRONMENT') === 'staging';
export const isDevelopment = process.env.NODE_ENV === 'development' || getEnv('VITE_APP_ENVIRONMENT') === 'development' || (!isProduction && !isStaging);
export const isViteDevelopment = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.DEV : isDevelopment;

/**
 * Feature flag detection
 */
export const enableAnalytics = getBoolEnv('VITE_ENABLE_ANALYTICS', false);
export const enablePerformance = getBoolEnv('VITE_ENABLE_PERFORMANCE_MONITORING', false);

/**
 * Validate required environment variables
 * @returns Object containing validation results and missing variables
 */
function validateFirebaseConfig() {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID'
  ];
  
  const missingVars = requiredVars.filter(
    varName => !getEnv(varName)
  );
  
  const isValid = missingVars.length === 0;
  
  // Only log in development or if there are issues
  if (isDevelopment || !isValid) {
    if (!isValid) {
      console.error(`Firebase initialization error: Missing required environment variables: ${missingVars.join(', ')}`);
    } else if (isDevelopment) {
      console.info("Firebase environment variables validated successfully");
    }
  }
  
  return { isValid, missingVars };
}

/**
 * Safely get Firebase configuration from environment variables
 * @returns Firebase configuration object with proper fallbacks
 */
function getFirebaseConfig(): FirebaseOptions {
  return {
    apiKey: getEnv('VITE_FIREBASE_API_KEY'),
    authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('VITE_FIREBASE_APP_ID'),
    measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID'),
  };
}

// Declare variables for Firebase services
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;
let analytics: Analytics | null = null;
let performance: Performance | null = null;

// Initialize Firebase with robust error handling
try {
  // Validate required environment variables
  const { isValid, missingVars } = validateFirebaseConfig();
  
  if (!isValid) {
    throw new Error(`Missing required Firebase configuration: ${missingVars.join(', ')}`);
  }
  
  const firebaseConfig = getFirebaseConfig();
  
  // Only log partial config in development (first 3 chars of API key for verification)
  if (isDevelopment) {
    console.info("Initializing Firebase with config:", {
      apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 3)}...` : undefined,
      projectId: firebaseConfig.projectId,
      environment: isProduction ? 'production' : (isStaging ? 'staging' : 'development')
    });
  }
  
  // Initialize Firebase app
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase services with granular error handling
  const initServices = async () => {
    // Initialize Authentication
    try {
      auth = getAuth(app);
      if (isDevelopment && typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
        // Connect to Auth emulator in development, if available
        // connectAuthEmulator(auth, 'http://localhost:9099');
        // console.info("Connected to Firebase Auth emulator");
      }
      if (isDevelopment) console.info("Firebase Auth initialized successfully");
    } catch (authError) {
      console.error("Error initializing Firebase Auth:", authError);
      auth = {} as Auth; // Fallback for type safety
    }
    
    // Initialize Firestore
    try {
      db = getFirestore(app);
      if (isDevelopment && typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
        // Connect to Firestore emulator in development, if available
        // connectFirestoreEmulator(db, 'localhost', 8080);
        // console.info("Connected to Firestore emulator");
      }
      if (isDevelopment) console.info("Firebase Firestore initialized successfully");
    } catch (dbError) {
      console.error("Error initializing Firestore:", dbError);
      db = {} as Firestore; // Fallback for type safety
    }
    
    // Initialize Storage
    try {
      storage = getStorage(app);
      if (isDevelopment && typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
        // Connect to Storage emulator in development, if available
        // connectStorageEmulator(storage, 'localhost', 9199);
        // console.info("Connected to Storage emulator");
      }
      if (isDevelopment) console.info("Firebase Storage initialized successfully");
    } catch (storageError) {
      console.error("Error initializing Storage:", storageError);
      storage = {} as FirebaseStorage; // Fallback for type safety
    }
    
    // Initialize Cloud Functions
    try {
      functions = getFunctions(app);
      if (isDevelopment && typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
        // Connect to Functions emulator in development, if available
        // connectFunctionsEmulator(functions, 'localhost', 5001);
        // console.info("Connected to Functions emulator");
      }
      if (isDevelopment) console.info("Firebase Functions initialized successfully");
    } catch (functionsError) {
      console.error("Error initializing Functions:", functionsError);
      functions = {} as Functions; // Fallback for type safety
    }
    
    // Only initialize browser-specific services if in a browser environment
    if (typeof window !== 'undefined') {
      // Initialize Analytics only in production/staging and if enabled
      if ((isProduction || isStaging) && enableAnalytics) {
        try {
          // Check if analytics is supported in current environment
          if (await isSupported()) {
            analytics = getAnalytics(app);
            if (isDevelopment) console.info("Firebase Analytics initialized successfully");
          } else {
            console.info("Firebase Analytics not supported in this environment");
          }
        } catch (analyticsError) {
          console.error("Error initializing Analytics:", analyticsError);
        }
      }
      
      // Initialize Performance Monitoring only in production/staging and if enabled
      if ((isProduction || isStaging) && enablePerformance) {
        try {
          performance = getPerformance(app);
          if (isDevelopment) console.info("Firebase Performance Monitoring initialized successfully");
        } catch (performanceError) {
          console.error("Error initializing Performance Monitoring:", performanceError);
        }
      }
    } else if (isDevelopment) {
      console.info("Skipping browser-only Firebase services in Node.js environment");
    }
    
    if (isDevelopment) console.info("All Firebase services initialized successfully");
  };
  
  // Initialize services
  initServices().catch(error => {
    console.error("Error during async Firebase service initialization:", error);
  });
  
} catch (error) {
  console.error("Critical error initializing Firebase:", error);
  
  // Create fallback implementations for development/testing
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
  functions = {} as Functions;
}

// Export Firebase services
export { 
  app, 
  auth, 
  db, 
  storage, 
  functions,
  analytics,
  performance
};
