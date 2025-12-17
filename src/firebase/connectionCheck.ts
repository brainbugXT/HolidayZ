import { db } from './config';
import { collection, getDocs, limit, query } from 'firebase/firestore';

let connectionStatus: 'unchecked' | 'connected' | 'error' = 'unchecked';
let connectionError: string | null = null;

/**
 * Check if Firebase is properly configured and connected
 */
export async function checkFirebaseConnection(): Promise<{
  isConnected: boolean;
  error?: string;
  needsSetup: boolean;
}> {
  // Check if environment variables are set
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (!apiKey || apiKey === 'YOUR_API_KEY' || !projectId || projectId === 'YOUR_PROJECT_ID') {
    return {
      isConnected: false,
      needsSetup: true,
      error: 'Firebase not configured. Please set up your Firebase credentials in .env.local'
    };
  }

  // Try to connect to Firestore
  try {
    // Attempt a simple read operation to verify connection
    const testQuery = query(collection(db, 'savings-goals'), limit(1));
    await getDocs(testQuery);
    
    connectionStatus = 'connected';
    return {
      isConnected: true,
      needsSetup: false
    };
  } catch (error: any) {
    connectionStatus = 'error';
    connectionError = error.message;
    
    // Check for common errors
    if (error.code === 'permission-denied') {
      return {
        isConnected: false,
        needsSetup: false,
        error: 'Firestore security rules are blocking access. Please update your security rules in Firebase Console.'
      };
    }
    
    if (error.code === 'unavailable') {
      return {
        isConnected: false,
        needsSetup: false,
        error: 'Cannot connect to Firebase. Check your internet connection.'
      };
    }
    
    return {
      isConnected: false,
      needsSetup: false,
      error: `Firebase connection error: ${error.message}`
    };
  }
}

export function getConnectionStatus() {
  return {
    status: connectionStatus,
    error: connectionError
  };
}
