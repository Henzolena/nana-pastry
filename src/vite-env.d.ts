/// <reference types="vite/client" />

/**
 * TypeScript declarations for Vite environment variables
 * This ensures proper type checking for all environment variables used in the application
 */
interface ImportMetaEnv {
  // Firebase Configuration
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string; // Optional
  
  // Application Settings
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_ENVIRONMENT?: 'production' | 'staging' | 'development';
  
  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS?: string | boolean;
  readonly VITE_ENABLE_PERFORMANCE_MONITORING?: string | boolean;
  
  // Allow for additional environment variables
  readonly [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
