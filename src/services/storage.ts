import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  StorageReference
} from 'firebase/storage';
import { storage } from '../lib/firebase';
import { v4 as uuidv4 } from 'uuid';

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
 * Upload a cake image
 * @param file Image file
 * @param cakeId Optional cake ID
 * @returns Download URL for the image
 */
export const uploadCakeImage = async (
  file: File,
  cakeId?: string
): Promise<string> => {
  const path = `${STORAGE_PATHS.CAKE_IMAGES}${cakeId ? `/${cakeId}` : ''}`;
  return uploadFile(file, path);
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
    throw error;
  }
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