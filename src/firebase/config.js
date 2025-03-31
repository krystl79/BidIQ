import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

// Default configuration for development
const defaultConfig = {
  apiKey: "AIzaSyDzPythGxO-KWPahujX65KxUQOqj8Rux6M",
  authDomain: "bidiq-8a697.firebaseapp.com",
  projectId: "bidiq-8a697",
  storageBucket: "bidiq-8a697.firebasestorage.app",
  messagingSenderId: "985256787837",
  appId: "1:985256787837:web:84c74b2c606c8845025614",
  measurementId: "G-HGFG3V7RTL"
};

// Use environment variables if available, otherwise use default config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: process.env.REACT_APP_FIREBASE_APP_ID || defaultConfig.appId,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || defaultConfig.measurementId
};

// Log configuration status (without sensitive values)
console.log('Firebase Config Status:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  hasMeasurementId: !!firebaseConfig.measurementId,
  environment: process.env.NODE_ENV,
  usingDefaultConfig: !process.env.REACT_APP_FIREBASE_API_KEY
});

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
let auth = null;

try {
  if (process.env.NODE_ENV !== 'test') {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    storage = getStorage(app);
    functions = getFunctions(app);
    
    // Only initialize analytics in browser environment
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
    console.log('Firebase initialized successfully');
  } else {
    // Mock Firebase services for testing
    app = {
      auth: () => ({}),
      firestore: () => ({})
    };
    auth = {};
    storage = {};
    functions = {};
    console.log('Using mock Firebase services for testing');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { app, auth, storage, functions, analytics }; 