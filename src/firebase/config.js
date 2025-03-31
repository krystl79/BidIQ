import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  // TODO: Replace with your Firebase config
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Only check for missing config in non-test environment
if (process.env.NODE_ENV !== 'test') {
  const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingConfig = requiredConfig.filter(key => !firebaseConfig[key]);

  if (missingConfig.length > 0) {
    console.error('Missing Firebase configuration:', missingConfig);
    throw new Error('Missing required Firebase configuration values');
  }
}

// Initialize Firebase only if we're not in a test environment
let app;
let storage;
let functions;
let analytics = null;

if (process.env.NODE_ENV !== 'test') {
  app = initializeApp(firebaseConfig);
  storage = getStorage(app);
  functions = getFunctions(app);
  
  // Only initialize analytics in browser environment
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} else {
  // Mock Firebase services for testing
  app = {
    auth: () => ({}),
    firestore: () => ({})
  };
  storage = {};
  functions = {};
}

export { app, storage, functions, analytics }; 