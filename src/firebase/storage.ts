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
      
      console.log('📤 Starting upload:', {
        fileName,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        fileType: file.type
      });
      
      // Create storage reference
      const storageRef = ref(storage, filePath);
      
      // Upload the file with timeout
      console.log('📤 Uploading to Firebase Storage...');
      const uploadPromise = uploadBytes(storageRef, file);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout - check Firebase Storage rules')), 30000)
      );
      
      await Promise.race([uploadPromise, timeoutPromise]);
      console.log('✅ Upload complete, getting download URL...');
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log('✅ Proof image uploaded successfully:', downloadURL);
      
      return downloadURL;
    } catch (error: any) {
      console.error('❌ Error uploading proof image:', error);
      
      // Provide helpful error messages
      if (error.code === 'storage/unauthorized') {
        throw new Error('Firebase Storage permission denied. Please configure Storage security rules.');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Upload timed out. Check your internet connection and Firebase Storage configuration.');
      } else {
        throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
      }
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
