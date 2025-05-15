// Test script for testing user signup and database creation
import { firebaseAdmin } from '../src/firebase-admin.config';
import * as admin from 'firebase-admin';

// Initialize Firestore
const firestore = firebaseAdmin.firestore();

async function testUserSystem() {
  console.log('🧪 Testing User Sign-Up and Database Creation');
  
  try {
    // Create a test user with a random email
    const randomId = Math.random().toString(36).substring(2, 8);
    const testEmail = `test-user-${randomId}@nanapastry.com`;
    const testPassword = 'Test@123456';
    const testDisplayName = `Test User ${randomId}`;
    
    console.log(`Creating test user: ${testEmail}`);
    
    // Create user in Firebase Auth
    const userRecord = await firebaseAdmin.auth().createUser({
      email: testEmail,
      password: testPassword,
      displayName: testDisplayName,
    });
    
    console.log(`✅ User created in Firebase Auth: ${userRecord.uid}`);
    
    // Check if user exists in Firestore
    console.log('Checking if user exists in Firestore...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for potential async processes
    
    const userDoc = await firestore.collection('users').doc(userRecord.uid).get();
    
    if (userDoc.exists) {
      console.log('✅ User record found in Firestore!');
      console.log('User data:', userDoc.data());
      
      // Check related collections
      console.log('Checking related collections...');
      
      const cartDoc = await firestore.collection('carts').doc(userRecord.uid).get();
      console.log(`Cart exists: ${cartDoc.exists}`);
      
      const wishlistDoc = await firestore.collection('wishlists').doc(userRecord.uid).get();
      console.log(`Wishlist exists: ${wishlistDoc.exists}`);
      
      const preferencesDoc = await firestore.collection('userPreferences').doc(userRecord.uid).get();
      console.log(`Preferences exists: ${preferencesDoc.exists}`);
      
    } else {
      console.log('❌ User record NOT found in Firestore. Integration failed.');
    }
    
    // Cleanup - delete the test user
    await firebaseAdmin.auth().deleteUser(userRecord.uid);
    console.log(`Test user deleted: ${userRecord.uid}`);
    
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the test
testUserSystem().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
