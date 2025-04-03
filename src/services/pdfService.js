import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractProposalInfo = async (file, userId) => {
  try {
    // Upload file to Firebase Storage
    const storageRef = ref(storage, `solicitations/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(storageRef);

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument(fileUrl);
    const pdf = await loadingTask.promise;

    // Extract text from all pages
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + ' ';
    }

    // Extract information using regex patterns
    const info = {
      dueDate: extractDueDate(fullText),
      dueTime: extractDueTime(fullText),
      solicitationNumber: extractSolicitationNumber(fullText),
      projectNumber: extractProjectNumber(fullText),
      projectName: extractProjectName(fullText),
      projectDescription: extractProjectDescription(fullText),
      projectSchedule: extractProjectSchedule(fullText),
      soqRequirements: extractSOQRequirements(fullText),
      contentRequirements: extractContentRequirements(fullText),
    };

    // Create proposal task list in Firestore
    const proposalData = {
      ...info,
      userId,
      createdAt: new Date(),
      status: 'draft',
      fileUrl,
      fileName: file.name,
    };

    const docRef = await addDoc(collection(db, 'proposals'), proposalData);
    return { id: docRef.id, ...proposalData };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
};

// Helper functions to extract specific information
const extractDueDate = (text) => {
  const datePatterns = [
    /due date:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /submission deadline:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /proposal due:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const extractDueTime = (text) => {
  const timePatterns = [
    /due time:?\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i,
    /submission time:?\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i,
  ];

  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const extractSolicitationNumber = (text) => {
  const patterns = [
    /solicitation number:?\s*([A-Z0-9-]+)/i,
    /rfp number:?\s*([A-Z0-9-]+)/i,
    /rfq number:?\s*([A-Z0-9-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const extractProjectNumber = (text) => {
  const patterns = [
    /project number:?\s*([A-Z0-9-]+)/i,
    /contract number:?\s*([A-Z0-9-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const extractProjectName = (text) => {
  const patterns = [
    /project name:?\s*([^\n]+)/i,
    /project title:?\s*([^\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
};

const extractProjectDescription = (text) => {
  const patterns = [
    /project description:?\s*([^\n]+(?:\n[^\n]+)*)/i,
    /scope of work:?\s*([^\n]+(?:\n[^\n]+)*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
};

const extractProjectSchedule = (text) => {
  const patterns = [
    /project schedule:?\s*([^\n]+(?:\n[^\n]+)*)/i,
    /timeline:?\s*([^\n]+(?:\n[^\n]+)*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
};

const extractSOQRequirements = (text) => {
  const requirements = {
    lengthLimit: null,
    fontSize: null,
    fontType: null,
  };

  // Extract length limit
  const lengthPatterns = [
    /page limit:?\s*(\d+)/i,
    /length limit:?\s*(\d+)/i,
    /maximum length:?\s*(\d+)/i,
  ];

  for (const pattern of lengthPatterns) {
    const match = text.match(pattern);
    if (match) {
      requirements.lengthLimit = match[1];
      break;
    }
  }

  // Extract font size
  const fontSizePatterns = [
    /font size:?\s*(\d+)/i,
    /text size:?\s*(\d+)/i,
  ];

  for (const pattern of fontSizePatterns) {
    const match = text.match(pattern);
    if (match) {
      requirements.fontSize = match[1];
      break;
    }
  }

  // Extract font type
  const fontTypePatterns = [
    /font type:?\s*([A-Za-z\s]+)/i,
    /font family:?\s*([A-Za-z\s]+)/i,
  ];

  for (const pattern of fontTypePatterns) {
    const match = text.match(pattern);
    if (match) {
      requirements.fontType = match[1].trim();
      break;
    }
  }

  return requirements;
};

const extractContentRequirements = (text) => {
  const patterns = [
    /content requirements:?\s*([^\n]+(?:\n[^\n]+)*)/i,
    /proposal requirements:?\s*([^\n]+(?:\n[^\n]+)*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}; 