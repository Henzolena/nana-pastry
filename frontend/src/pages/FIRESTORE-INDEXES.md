# Firestore Indexes Guide for Nana Pastry

This guide explains how to set up the required Firestore indexes for the Nana Pastry application.

## Required Indexes

The application requires the following composite indexes:

1. **Order History Index**
   - Collection: `orders`
   - Fields: 
     - `userId` (Ascending)
     - `createdAt` (Descending)

This index is necessary for efficiently querying a user's order history sorted by creation date.

## Creating Indexes

### Method 1: Using the Direct Link

If you see an administrator alert in the application with a "Create Index in Firebase Console" button, you can click it to be directed to the Firebase Console with the index pre-configured.

### Method 2: Manual Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and select your project
2. Navigate to **Firestore Database** in the left menu
3. Click on the **Indexes** tab
4. Click on **Add Index**
5. Fill in the following information:
   - Collection ID: `orders`
   - Fields:
     - Field path: `userId`, Order: `Ascending`
     - Field path: `createdAt`, Order: `Descending`
   - Query scope: `Collection`
6. Click **Create**

The index will start building, which might take a few minutes. Once it's active, the queries will start working efficiently.

## Troubleshooting

If you're still seeing index errors after creating the necessary indexes:

1. Make sure the index has finished building (it will show as "Enabled" in the Firebase Console)
2. Check if you've created the index with the exact field names and order directions as specified
3. Restart your application
4. Clear your browser cache

## Additional Indexes

As the application grows, you might need to add more indexes. Here are some that might be useful in the future:

- **Filtered Orders by Status**
  - Collection: `orders`
  - Fields:
    - `status` (Ascending)
    - `createdAt` (Descending)

- **User Orders by Status**
  - Collection: `orders`
  - Fields:
    - `userId` (Ascending)
    - `status` (Ascending)
    - `createdAt` (Descending)

## Performance Considerations

Firestore charges based on the number of indexes and the operations performed on them. While indexes make queries faster, having too many unnecessary indexes can increase costs and slow down write operations.

Only create indexes that are necessary for your application's queries. 