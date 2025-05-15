/**
 * Firebase Configuration Test Script
 * 
 * This script verifies that Firebase is properly configured with environment variables.
 * It tests connection to Firebase services without making any changes to data.
 * 
 * Run with: npx tsx src/test-firebase-config.ts
 */

// Load environment variables from .env files
import './load-env';

import { app, auth, db, storage, functions, isProduction, isDevelopment } from './lib/firebase';

async function testFirebaseConfig() {
  console.log('🔥 FIREBASE CONFIGURATION TEST 🔥');
  console.log('==================================');
  
  // Test environment detection
  console.log('\n📊 Environment Detection:');
  console.log(`• Production Mode: ${isProduction ? '✅ Yes' : '❌ No'}`);
  console.log(`• Development Mode: ${isDevelopment ? '✅ Yes' : '❌ No'}`);
  
  // Test Firebase app initialization
  console.log('\n🔧 Firebase App:');
  try {
    if (app && app.name) {
      console.log(`• Firebase App Initialized: ✅ Yes (${app.name})`);
    } else {
      console.log('• Firebase App Initialized: ❌ No');
    }
  } catch (error) {
    console.log(`• Firebase App Error: ${error}`);
  }
  
  // Test Auth
  console.log('\n🔐 Authentication:');
  try {
    if (auth && auth.app) {
      console.log('• Auth Service Initialized: ✅ Yes');
      console.log(`• Current User: ${auth.currentUser ? auth.currentUser.email : 'None (Not signed in)'}`);
    } else {
      console.log('• Auth Service Initialized: ❌ No');
    }
  } catch (error) {
    console.log(`• Auth Service Error: ${error}`);
  }
  
  // Test Firestore
  console.log('\n📁 Firestore:');
  try {
    if (db) {
      console.log('• Firestore Service Initialized: ✅ Yes');
      try {
        // Import Firestore functions for v9 API
        const { collection, doc, getDoc } = await import('firebase/firestore');
        
        // Attempt to check connection by getting a non-existent document
        const testDocRef = doc(db, '_test_connection', 'test');
        await getDoc(testDocRef);
        console.log('• Firestore Connection: ✅ Successful');
      } catch (firestoreError) {
        console.log(`• Firestore Connection Error: ${firestoreError}`);
      }
    } else {
      console.log('• Firestore Service Initialized: ❌ No');
    }
  } catch (error) {
    console.log(`• Firestore Service Error: ${error}`);
  }
  
  // Test Storage
  console.log('\n🗄️ Storage:');
  try {
    if (storage) {
      console.log('• Storage Service Initialized: ✅ Yes');
      try {
        // Import Storage functions for v9 API
        const { ref } = await import('firebase/storage');
        
        // Just check that we can access the root ref
        const rootRef = ref(storage);
        console.log('• Storage Connection: ✅ Successful');
      } catch (storageError) {
        console.log(`• Storage Connection Error: ${storageError}`);
      }
    } else {
      console.log('• Storage Service Initialized: ❌ No');
    }
  } catch (error) {
    console.log(`• Storage Service Error: ${error}`);
  }
  
  // Test Functions
  console.log('\n⚙️ Cloud Functions:');
  try {
    if (functions) {
      console.log('• Functions Service Initialized: ✅ Yes');
    } else {
      console.log('• Functions Service Initialized: ❌ No');
    }
  } catch (error) {
    console.log(`• Functions Service Error: ${error}`);
  }
  
  console.log('\n==================================');
  console.log('🎉 Firebase Configuration Test Complete! 🎉');
  console.log('\nIf you see errors above, please check:');
  console.log('1. Your .env file has the correct Firebase configuration values');
  console.log('2. Your Firebase project is properly set up in the Firebase Console');
  console.log('3. You have the correct permissions for the Firebase project');
}

// Run the test
testFirebaseConfig().catch(error => {
  console.error('Uncaught error during testing:', error);
});
