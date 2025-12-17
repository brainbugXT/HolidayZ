import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export const storageService = {
  /**
   * Upload an image file to Firebase Storage
   * @param file - The image file to upload
   * @param entryId - The ID of the savings entry (used in file path)
   * @returns The download URL of the uploaded image
   */
  async uploadProofImage(file: File, entryId: string): Promise<string> {
    try {
      // Create a unique filename with timestamp to avoid conflicts
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${entryId}_${timestamp}.${fileExtension}`;
      const filePath = `proof-images/${fileName}`;
      
      // Create storage reference
      const storageRef = ref(storage, filePath);
      
      // Upload the file
      console.log('📤 Uploading proof image to Firebase Storage...');
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log('✅ Proof image uploaded successfully:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading proof image:', error);
      throw error;
    }
  },

  /**
   * Delete a proof image from Firebase Storage
   * @param imageUrl - The full download URL of the image to delete
   */
  async deleteProofImage(imageUrl: string): Promise<void> {
    try {
      // Extract the path from the full URL
      const urlObj = new URL(imageUrl);
      const path = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);
      
      // Create storage reference
      const storageRef = ref(storage, path);
      
      // Delete the file
      console.log('🗑️ Deleting proof image from Firebase Storage...');
      await deleteObject(storageRef);
      console.log('✅ Proof image deleted successfully');
    } catch (error) {
      console.error('Error deleting proof image:', error);
      // Don't throw error - deletion failure shouldn't prevent entry deletion
    }
  }
};
