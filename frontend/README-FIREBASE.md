# Firebase Setup for Nana's Pastry

This document provides comprehensive instructions for setting up Firebase in the Nana's Pastry project with secure credential management.

## Prerequisites

Before you begin, make sure you have:

1. Node.js and npm installed
2. A Firebase account
3. A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)

## Installation

Install the Firebase SDK:

```bash
npm install firebase
```

## Environment Configuration

### Creating Environment Files

The project uses environment variables to securely configure Firebase. We provide a robust approach for managing these configurations:

1. Copy the `.env.example` file to create a new `.env` file:

```bash
cp .env.example .env
```

2. Edit the `.env` file with your Firebase project credentials (found in your Firebase project settings > Project settings > General > Your apps):

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

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

# Environment
VITE_APP_ENVIRONMENT="development"
```

### Environment-Specific Configuration

For different environments, you can create specific environment files:

- `.env.development` - Used for local development
- `.env.staging` - Used for staging environment
- `.env.production` - Used for production environment

These files should follow the same format as `.env.example` but with environment-specific values.

### Security Considerations

- **IMPORTANT**: NEVER commit your `.env` files to version control. They are already added to `.gitignore`.
- Only use the Firebase configuration on the client side for authentication and basic operations.
- For sensitive operations, use Firebase Cloud Functions and proper security rules.

## Firebase Services Configuration

### Authentication

1. In the Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. (Optional) Configure any additional authentication providers as needed

### Firestore Database

1. In the Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** for production or **Start in test mode** for development
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

### Analytics & Performance Monitoring

These services are automatically configured in the Firebase initialization but only enabled in production/staging environments and if the respective feature flags are set to true in your environment variables.

## Enhanced Initialization

Firebase is initialized in `src/lib/firebase.ts` with the following advanced features:

- **Environment Detection**: Automatically detects and configures based on the environment
- **Feature Flags**: Enables/disables services like Analytics and Performance Monitoring
- **Robust Error Handling**: Graceful fallbacks if services fail to initialize
- **Type Safety**: Full TypeScript support for all Firebase services
- **Emulator Support**: Prepared configuration for local development with Firebase emulators
- **Secure Credentials Management**: Environment variables with proper validation

## Exported Firebase Services

The following Firebase services are exported from `src/lib/firebase.ts`:

- `app`: The Firebase app instance
- `auth`: Firebase Authentication
- `db`: Firestore Database
- `storage`: Firebase Storage
- `functions`: Firebase Cloud Functions
- `analytics`: Firebase Analytics (conditionally loaded)
- `performance`: Firebase Performance (conditionally loaded)

## Using Firebase in Components

Import the Firebase services in your components:

```typescript
import { auth, db, storage } from '../lib/firebase';

// Example: Get current user
const user = auth.currentUser;

// Example: Access Firestore
const userDoc = await db.collection('users').doc(userId).get();

// Example: Upload to storage
const storageRef = storage.ref(`uploads/${fileName}`);
```

## Security Rules

For production, you should configure proper security rules for Firestore and Storage. Example rules are available in:

- `firestore.rules` - For Firestore Database
- `storage.rules` - For Storage

Deploy these rules using the Firebase CLI:

```bash
firebase deploy --only firestore:rules,storage:rules
```

## Local Development with Emulators (Optional)

For local development without affecting production data, you can use Firebase Emulators:

1. Install the Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init emulators
```

4. Start the emulators:
```bash
firebase emulators:start
```

5. Uncomment the emulator connection code in `src/lib/firebase.ts` to use the local emulators.

## Troubleshooting

If you encounter errors related to Firebase:

1. Check that all environment variables are correctly set
2. Verify the console for specific error messages from the initialization
3. Ensure Firebase is installed: `npm install firebase`
4. Verify your Firebase project settings in the Firebase Console
5. For Firestore query errors, check if the required indexes are created and active
6. Check browser console for detailed error messages

## Advanced: CI/CD Integration

When using CI/CD, ensure your environment variables are properly set in your CI/CD platform's secrets or environment configuration. Never hardcode Firebase credentials in your code or CI/CD scripts.
