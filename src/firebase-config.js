// Firebase configuration for backend
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAkmFLpWPDcjkzK3tYE0g0gNx4fxU74V8c",
  authDomain: "test-539e9.firebaseapp.com",
  projectId: "test-539e9",
  storageBucket: "test-539e9.firebasestorage.app",
  messagingSenderId: "1029641902756",
  appId: "1:1029641902756:web:3d5523acfaf6133954a431",
  measurementId: "G-NXL1RJJD0M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage and Firestore
export const storage = getStorage(app);
export const db = getFirestore(app);

// Configure Firestore settings for better performance
const firestoreSettings = {
  cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
  experimentalForceLongPolling: true, // Better for some network conditions
  useFetchStreams: false, // Disable for better compatibility
};

// Apply settings if not in development
if (process.env.NODE_ENV !== 'development') {
  // In production, we don't connect to emulator
} else {
  // In development, optionally connect to emulator
  // Uncomment the next line if you want to use Firestore emulator
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app; 