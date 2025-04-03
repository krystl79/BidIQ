import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import * as pdfjsLib from 'pdfjs-dist';
import { app } from '../config.js';

// Initialize services using the existing Firebase app
const storage = getStorage(app);
const db = getFirestore(app);

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

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
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Extract text from all pages
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + ' ';
    }

    // Extract information using helper functions
    const proposalInfo = {
      dueDate: extractDueDate(fullText),
      dueTime: extractDueTime(fullText),
      solicitationNumber: extractSolicitationNumber(fullText),
      projectNumber: extractProjectNumber(fullText),
      projectName: extractProjectName(fullText),
      projectDescription: extractProjectDescription(fullText),
      projectSchedule: extractProjectSchedule(fullText),
      soqRequirements: extractSOQRequirements(fullText),
      contentRequirements: extractContentRequirements(fullText),
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

export const uploadFile = async (file, userId) => {
  try {
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}-${file.name}`;
    const storageRef = ref(storage, `solicitations/${userId}/${fileName}`);
    
    // Set metadata without custom CORS headers (these are handled by bucket configuration)
    const metadata = {
      contentType: file.type
    };

    // Upload with retry logic
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        const snapshot = await uploadBytes(storageRef, file, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return {
          fileName,
          downloadURL,
          timestamp
        };
      } catch (error) {
        lastError = error;
        console.warn(`Upload attempt ${4 - retries} failed:`, error);
        retries--;
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw lastError;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file after multiple attempts: ${error.message}`);
  }
}; 