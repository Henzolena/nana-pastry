/**
 * Firebase Service Re-export
 * 
 * IMPORTANT: This file now re-exports Firebase services from the central src/lib/firebase.ts
 * to maintain backward compatibility for components that import from this location.
 * 
 * New components should import Firebase services directly from src/lib/firebase.ts instead.
 */

import { 
  app, 
  auth, 
  db, 
  storage, 
  functions,
  analytics,
  performance,
  isProduction,
  isDevelopment,
  isViteDevelopment,
  isStaging
} from '../lib/firebase';

// Re-export all Firebase services and helpers
export { 
  app, 
  auth, 
  db, 
  storage, 
  functions,
  analytics,
  performance,
  isProduction,
  isDevelopment,
  isViteDevelopment,
  isStaging
};

// Log deprecation warning in development only
if (isDevelopment) {
  console.warn(
    'DEPRECATION NOTICE: Importing Firebase services from src/services/firebase.ts is deprecated. ' +
    'Please update your imports to use src/lib/firebase.ts instead.'
  );
}
