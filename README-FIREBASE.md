# Firebase Setup for Nana's Pastry

This document provides instructions for setting up Firebase in the Nana's Pastry project.

## Prerequisites

Before you begin, make sure you have:

1. Node.js and npm installed
2. A Firebase account
3. A Firebase project created in the Firebase Console

## Installation

Install the Firebase SDK:

```bash
npm install firebase
```

## Environment Variables

The project uses environment variables to configure Firebase. Create a `.env` file in the src directory with the following variables:

```
# Firebase Configuration
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id"

# Application Settings
VITE_APP_NAME="Nana's Pastry"
```

You can find these values in your Firebase project settings.

## Firebase Services Setup

### Authentication

1. In the Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. (Optional) Configure any additional authentication providers as needed

### Firestore Database

1. In the Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** or **Start in test mode** (for development)
4. Select a location for your database
5. Click **Enable**

#### Required Firestore Indexes

The application requires the following composite indexes for optimal performance:

1. **Orders Index (Required)**
   - Collection: `orders`
   - Fields:
     - `userId` (Ascending)
     - `createdAt` (Descending)

To create this index:

1. In the Firebase Console, go to **Firestore Database** > **Indexes** tab
2. Click **Create index**
3. For Collection ID, enter `orders`
4. Add fields:
   - Field path: `userId`, Order: `Ascending`
   - Field path: `createdAt`, Order: `Descending`
5. Query scope: **Collection**
6. Click **Create**

The index will take some time to build. Until the index is active, the application will handle queries using a fallback method, but performance may be reduced.

For more detailed guidance on Firestore indexes, see [FIRESTORE-INDEXES.md](./src/pages/FIRESTORE-INDEXES.md).

### Storage

1. In the Firebase Console, go to **Storage**
2. Click **Get started**
3. Review and accept the default security rules (you can modify these later)
4. Select a location for your storage bucket
5. Click **Done**

## TypeScript Configuration

The project includes TypeScript type declarations for the environment variables in `src/vite-env.d.ts`.

## Firebase Initialization

Firebase is initialized in `src/lib/firebase.ts`. This file exports the following Firebase services:

- `app`: The Firebase app instance
- `analytics`: Firebase Analytics
- `auth`: Firebase Authentication
- `db`: Firestore Database
- `storage`: Firebase Storage
- `functions`: Firebase Cloud Functions

The initialization includes error handling to ensure the application can run even if Firebase is not properly configured.

## Security Rules

For production, you should configure proper security rules for Firestore and Storage. Example rules are available in:

- `firestore.rules` - For Firestore Database
- `storage.rules` - For Storage

Deploy these rules using the Firebase CLI:

```bash
firebase deploy --only firestore:rules,storage:rules
```

## Usage

Import the Firebase services in your components:

```typescript
import { auth, db, storage } from '../lib/firebase';

// Use Firebase services in your component
```

## Troubleshooting

If you encounter errors related to Firebase:

1. Check that all environment variables are correctly set
2. Ensure Firebase is installed: `npm install firebase`
3. Verify your Firebase project is properly configured in the Firebase Console
4. For Firestore query errors, check if the required indexes are created and active
5. Check browser console for detailed error messages 