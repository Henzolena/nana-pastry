# Firebase Setup Guide for Nana's Pastry

This guide will help you set up Firebase for the Nana's Pastry application.

## Prerequisites

- Node.js and npm installed
- Firebase account
- Firebase CLI (optional, for deploying and using emulators)

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "Nana's Pastry")
4. Configure Google Analytics (optional)
5. Create the project

## Step 2: Register Your Web App

1. In the Firebase project dashboard, click the web icon (</>) to add a web app
2. Register your app with a nickname (e.g., "Nana's Pastry Web")
3. Optionally set up Firebase Hosting
4. Click "Register app"
5. Copy the Firebase configuration

## Step 3: Set Up Firebase Services

### Authentication

1. In the Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable Email/Password authentication
4. Optionally, set up other providers (Google, Facebook, etc.)

### Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose start mode (Production or Test)
4. Select a location for your database
5. Set up security rules (you can start with test mode and update later)

### Storage

1. Go to "Storage"
2. Click "Get started"
3. Review and configure security rules
4. Select a location for your storage bucket

## Step 4: Configure Your Application

1. Create a `.env` file at the root of your project
2. Copy the content from `.env.example` to `.env`
3. Replace the placeholder values with your Firebase configuration:

```
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id"
```

## Step 5: Install Firebase SDK

The Firebase SDK is already installed in the project. If you need to reinstall:

```bash
npm install firebase
```

## Step 6: Using Firebase Services

The project is already set up with the following Firebase services:

### Authentication

Use the `AuthContext` to manage user authentication:

```jsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signUp, logout } = useAuth();
  
  // Use these methods to authenticate users
}
```

### Firestore

Use the Firestore service for database operations:

```jsx
import { addDocument, getDocumentById, updateDocument } from '@/lib/firestore';

// Add a document
const docId = await addDocument('collection-name', { field: 'value' });

// Get a document
const doc = await getDocumentById('collection-name', 'document-id');

// Update a document
await updateDocument('collection-name', 'document-id', { field: 'new-value' });
```

### Storage

Use the Storage service for file operations:

```jsx
import { uploadFile, getDownloadURL } from '@/services/storage';

// Upload a file
const url = await uploadFile(file, 'path/to/save');

// Get a download URL
const downloadUrl = await getDownloadURL('file-path');
```

## Step 7: Local Development with Emulators (Optional)

To use Firebase emulators for local development:

1. Install the Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase in your project:
```bash
firebase init
```

3. Select the services you want to emulate (Auth, Firestore, Storage, Functions)

4. Start the emulators:
```bash
firebase emulators:start
```

5. Uncomment the emulator configuration in your `.env` file:
```
VITE_USE_FIREBASE_EMULATORS=true
VITE_FIREBASE_AUTH_EMULATOR_URL="http://localhost:9099"
VITE_FIREBASE_FIRESTORE_EMULATOR_URL="localhost:8080"
VITE_FIREBASE_STORAGE_EMULATOR_URL="localhost:9199"
VITE_FIREBASE_FUNCTIONS_EMULATOR_URL="localhost:5001"
```

## Security Considerations

- Never commit your `.env` file to version control
- Set up proper Firestore and Storage security rules
- Implement proper authentication checks in your application
- Consider adding rate limiting for sensitive operations

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Web SDK Reference](https://firebase.google.com/docs/reference/js)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite) 