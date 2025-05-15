import * as admin from 'firebase-admin';
import * as fs from 'fs'; // Import file system module
import * as path from 'path';
import * as dotenv from 'dotenv'; 

// Force dotenv to load environment variables again to ensure they're available
dotenv.config();

// Safely access environment variables (basic version for backend)
const getBackendEnv = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

// Define default path for the service account file
const defaultServiceAccountPath = path.join(process.cwd(), 'nana-pastry-firebase-adminsdk-fbsvc-0ec06bff26.json');

let serviceAccount;
try {
  // Try to get the path from the environment variable
  let serviceAccountPath = getBackendEnv('FIREBASE_ADMIN_SDK_CONFIG');
  
  // If not in environment, try the default path
  if (!serviceAccountPath && fs.existsSync(defaultServiceAccountPath)) {
    serviceAccountPath = defaultServiceAccountPath;
    console.log('Using default service account path:', defaultServiceAccountPath);
  }
  
  if (!serviceAccountPath) {
    throw new Error('FIREBASE_ADMIN_SDK_CONFIG environment variable is not set and default file not found.');
  }
  
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Service account file not found at path: ${serviceAccountPath}`);
  }
  
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  console.log('Firebase Admin SDK service account loaded successfully.');
} catch (error) {
  console.error('Failed to load Firebase Admin SDK config:', error);
  // Depending on your setup, you might want to exit the process or handle this differently
  // For now, we'll allow the app to start but Firebase Admin will not be functional.
}


if (!admin.apps.length && serviceAccount) {
  // Get project ID from environment variables, falling back to VITE_FIREBASE_PROJECT_ID if needed
  const projectId = getBackendEnv('FIREBASE_PROJECT_ID') || getBackendEnv('VITE_FIREBASE_PROJECT_ID');

  if (!projectId) {
      console.error('Firebase initialization error: Project ID is missing.');
      // Handle missing project ID if necessary
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: projectId,
    // databaseURL and storageBucket are only needed if you use those services
    // databaseURL: getBackendEnv('FIREBASE_DATABASE_URL'),
    // storageBucket: getBackendEnv('FIREBASE_STORAGE_BUCKET'),
  });
  console.log('Firebase Admin SDK initialized successfully.');

  // Configure Firestore settings
  admin.firestore().settings({ ignoreUndefinedProperties: true });
  console.log('Firestore ignoreUndefinedProperties set to true.');
} else if (admin.apps.length) {
    console.log('Firebase Admin SDK already initialized.');
} else {
    console.warn('Firebase Admin SDK not initialized due to missing service account config.');
}


export const firebaseAdmin = admin;
