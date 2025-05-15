import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from '../lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { showErrorToast } from '@/utils/toast'; // Import toast for errors

// Storage folder paths
const STORAGE_PATHS = {
  CAKE_IMAGES: 'cakes',
  USER_AVATARS: 'avatars',
  ORDER_ATTACHMENTS: 'orders'
};

/**
 * Upload a file to Firebase Storage
 * @param file File to upload
 * @param path Storage path
 * @param customFileName Optional custom file name
 * @returns Download URL for the uploaded file
 */
export const uploadFile = async (
  file: File,
  path: string,
  customFileName?: string
): Promise<string> => {
  try {
    // Create a file name with UUID to avoid duplicates
    const fileName = customFileName || `${uuidv4()}_${file.name}`;
    const storageRef = ref(storage, `${path}/${fileName}`);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get and return the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload multiple cake images
 * @param files Array of image files
 * @param bakerId The UID of the baker (for structuring storage path)
 * @param cakeId Optional cake ID (for structuring storage path in edit mode)
 * @returns Promise with an array of download URLs for the uploaded images
 */
export const uploadCakeImages = async (
  files: File[],
  bakerId: string,
  cakeId?: string
): Promise<string[]> => {
  if (!bakerId) {
    console.error("Baker ID is required to upload cake images.");
    showErrorToast("Authentication error: Cannot upload images.");
    throw new Error("Baker ID is required for image upload.");
  }

  const uploadPromises = files.map(async (file) => {
    const path = `${STORAGE_PATHS.CAKE_IMAGES}/${bakerId}${cakeId ? `/${cakeId}` : ''}`;
    // Use original file name + UUID to ensure uniqueness, but keep original extension
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}_${file.name.substring(0, file.name.lastIndexOf('.'))}.${fileExtension}`;

    const storageRef = ref(storage, `${path}/${fileName}`);

    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error(`Error uploading image ${file.name}:`, error);
      throw error; // Re-throw to indicate failure
    }
  });

  // Wait for all uploads to complete
  const downloadURLs = await Promise.all(uploadPromises);
  return downloadURLs;
};

/**
 * Delete a file from Firebase Storage by URL
 * @param downloadURL Download URL of the file to delete
 * @returns Promise indicating success
 */
export const deleteFileByUrl = async (downloadURL: string): Promise<void> => {
  try {
    // Create a reference from the URL
    const fileRef = ref(storage, downloadURL);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't re-throw here, deletion of old images shouldn't block main operation
  }
};

/**
 * Delete multiple files from Firebase Storage by their URLs
 * @param downloadURLs Array of download URLs of the files to delete
 * @returns Promise indicating success (resolves even if some deletions fail)
 */
export const deleteCakeImagesByUrls = async (downloadURLs: string[]): Promise<void> => {
    const deletePromises = downloadURLs.map(url => deleteFileByUrl(url));
    await Promise.all(deletePromises); // Wait for all deletion attempts
};


/**
 * Upload a user avatar
 * @param file Avatar image file
 * @param userId User ID
 * @returns Download URL for the avatar
 */
export const uploadUserAvatar = async (
  file: File,
  userId: string
): Promise<string> => {
  // Use jpg extension for consistency
  const fileName = `${userId}_avatar.jpg`;
  return uploadFile(file, STORAGE_PATHS.USER_AVATARS, fileName);
};

/**
 * Upload order attachment
 * @param file Attachment file
 * @param orderId Order ID
 * @returns Download URL for the attachment
 */
export const uploadOrderAttachment = async (
  file: File,
  orderId: string
): Promise<string> => {
  const path = `${STORAGE_PATHS.ORDER_ATTACHMENTS}/${orderId}`;
  return uploadFile(file, path);
};

/**
 * Get all files in a path
 * @param path Storage path
 * @returns Array of download URLs
 */
export const getFilesInPath = async (path: string): Promise<string[]> => {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);

    const urls = await Promise.all(
      result.items.map(async (itemRef) => {
        return await getDownloadURL(itemRef);
      })
    );

    return urls;
  } catch (error) {
    console.error('Error getting files in path:', error);
    throw error;
  }
};

/**
 * Get all cake images for a specific cake
 * @param cakeId Cake ID
 * @returns Array of download URLs
 */
export const getCakeImages = async (cakeId: string): Promise<string[]> => {
  const path = `${STORAGE_PATHS.CAKE_IMAGES}/${cakeId}`;
  return getFilesInPath(path);
};
