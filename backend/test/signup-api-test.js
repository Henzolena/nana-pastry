// Test script to test the signup endpoint
const fetch = require('node-fetch');
const { firebaseAdmin } = require('../src/firebase-admin.config');

async function testSignup() {
  console.log('🧪 Testing User Signup API Endpoint');
  
  try {
    // Create random test user data
    const randomId = Math.random().toString(36).substring(2, 8);
    const testUser = {
      email: `test-user-${randomId}@nanapastry.com`,
      password: 'Test@123456',
      displayName: `Test User ${randomId}`
    };
    
    console.log(`Creating test user via API: ${testUser.email}`);
    
    // Call the signup API endpoint
    const response = await fetch('http://localhost:3000/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ User created successfully via API');
      console.log('Response:', result);
      
      const uid = result.uid;
      
      // Check if user exists in Firestore
      console.log('Checking if user exists in Firestore...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for async processes
      
      const userDoc = await firebaseAdmin.firestore().collection('users').doc(uid).get();
      
      if (userDoc.exists) {
        console.log('✅ User record found in Firestore!');
        console.log('User data:', userDoc.data());
        
        // Check related collections
        const cartDoc = await firebaseAdmin.firestore().collection('carts').doc(uid).get();
        console.log(`Cart exists: ${cartDoc.exists}`);
        
        const wishlistDoc = await firebaseAdmin.firestore().collection('wishlists').doc(uid).get();
        console.log(`Wishlist exists: ${wishlistDoc.exists}`);
        
        const preferencesDoc = await firebaseAdmin.firestore().collection('userPreferences').doc(uid).get();
        console.log(`Preferences exists: ${preferencesDoc.exists}`);
      } else {
        console.log('❌ User record NOT found in Firestore. Integration failed.');
      }
      
      // Cleanup - delete the test user
      await firebaseAdmin.auth().deleteUser(uid);
      console.log(`Test user deleted: ${uid}`);
    } else {
      console.log('❌ Failed to create user via API');
      console.log('Error:', result);
    }
    
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Check if the server is running before testing
async function checkServerRunning() {
  try {
    const response = await fetch('http://localhost:3000', { 
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main function
async function main() {
  // Check if server is running
  console.log('Checking if server is running...');
  const isServerRunning = await checkServerRunning();
  
  if (isServerRunning) {
    console.log('✅ Server is running');
    await testSignup();
  } else {
    console.log('❌ Server is not running. Please start the server with:');
    console.log('  npm run start:dev');
  }
  
  console.log('Test completed');
}

// Run the test
main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
