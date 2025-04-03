import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import pdfParse from 'pdf-parse';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxXhXhXhXhXhXhXhXhXhXhXhXhXhXhXhXh",
  authDomain: "bidiq-7c0c1.firebaseapp.com",
  projectId: "bidiq-7c0c1",
  storageBucket: "bidiq-7c0c1.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize services
const storage = getStorage(app);
const db = getFirestore(app);

// Helper functions to extract information using regex
const extractDueDate = (text) => {
  const datePattern = /(?:due date|submission deadline|proposal due):\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i;
  const match = text.match(datePattern);
  return match ? match[1] : null;
};

const extractDueTime = (text) => {
  const timePattern = /(?:due time|submission time|proposal time):\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i;
  const match = text.match(timePattern);
  return match ? match[1] : null;
};

const extractSolicitationNumber = (text) => {
  const pattern = /(?:solicitation number|rfq number|proposal number):\s*([A-Z0-9-]+)/i;
  const match = text.match(pattern);
  return match ? match[1] : null;
};

const extractProjectNumber = (text) => {
  const pattern = /(?:project number|job number):\s*([A-Z0-9-]+)/i;
  const match = text.match(pattern);
  return match ? match[1] : null;
};

const extractProjectName = (text) => {
  const pattern = /(?:project name|project title):\s*([^\n]+)/i;
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
};

const extractProjectDescription = (text) => {
  const pattern = /(?:project description|scope of work):\s*([^\n]+(?:\n[^\n]+)*)/i;
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
};

const extractProjectSchedule = (text) => {
  const pattern = /(?:project schedule|timeline|duration):\s*([^\n]+(?:\n[^\n]+)*)/i;
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
};

const extractSOQRequirements = (text) => {
  const pattern = /(?:soq requirements|statement of qualifications requirements):\s*([^\n]+(?:\n[^\n]+)*)/i;
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
};

const extractContentRequirements = (text) => {
  const pattern = /(?:content requirements|proposal content):\s*([^\n]+(?:\n[^\n]+)*)/i;
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
};

export const extractProposalInfo = async (file, userId) => {
  try {
    // Upload file to Firebase Storage
    const storageRef = ref(storage, `solicitations/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // Read the PDF file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdfParse(buffer);
    const text = data.text;

    // Extract information using helper functions
    const proposalInfo = {
      dueDate: extractDueDate(text),
      dueTime: extractDueTime(text),
      solicitationNumber: extractSolicitationNumber(text),
      projectNumber: extractProjectNumber(text),
      projectName: extractProjectName(text),
      projectDescription: extractProjectDescription(text),
      projectSchedule: extractProjectSchedule(text),
      soqRequirements: extractSOQRequirements(text),
      contentRequirements: extractContentRequirements(text),
      fileUrl: downloadURL,
      userId,
      createdAt: new Date().toISOString()
    };

    // Store in Firestore
    const docRef = await addDoc(collection(db, 'proposals'), proposalInfo);

    return {
      id: docRef.id,
      ...proposalInfo
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}; 