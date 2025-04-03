import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../config.js';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize Firestore using the existing Firebase app
const db = getFirestore(app);

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Helper function to convert file to ArrayBuffer
const fileToArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Helper functions to extract information using regex
const extractDueDate = (text) => {
  const datePattern = /(?:due date|submission deadline|proposal due):\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i;
  const match = text.match(datePattern);
  return match ? match[1] : null;
};

const extractDueTime = (text) => {
  const timePattern = /(?:due time|submission time):\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i;
  const match = text.match(timePattern);
  return match ? match[1] : null;
};

const extractSolicitationNumber = (text) => {
  const pattern = /(?:solicitation|RFP|RFQ)\s*(?:number|no\.?|#)?:\s*([A-Z0-9-]+)/i;
  const match = text.match(pattern);
  return match ? match[1] : null;
};

const extractProjectNumber = (text) => {
  const pattern = /(?:project|job)\s*(?:number|no\.?|#)?:\s*([A-Z0-9-]+)/i;
  const match = text.match(pattern);
  return match ? match[1] : null;
};

const extractProjectName = (text) => {
  const pattern = /(?:project|job)\s*(?:name|title)?:\s*([^\n]+)/i;
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
};

const extractProjectDescription = (text) => {
  const pattern = /(?:project|job)\s*(?:description|scope)?:\s*([^\n]+)/i;
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
};

const extractProjectSchedule = (text) => {
  const pattern = /(?:project|job)\s*(?:schedule|timeline)?:\s*([^\n]+)/i;
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
};

const extractSOQRequirements = (text) => {
  const pattern = /(?:SOQ|statement of qualifications)\s*(?:requirements)?:\s*([^\n]+)/i;
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
};

const extractContentRequirements = (text) => {
  const pattern = /(?:content|submission)\s*(?:requirements)?:\s*([^\n]+)/i;
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
};

export const extractProposalInfo = async (file, userId) => {
  try {
    // Validate inputs
    if (!file) {
      throw new Error('File is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!file.name || !file.size) {
      throw new Error('Invalid file object');
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await fileToArrayBuffer(file);

    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log('PDF loaded, pages:', pdf.numPages);

    // Extract text from all pages
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    // Extract information using helper functions
    const proposalInfo = {
      dueDate: extractDueDate(fullText) || '',
      dueTime: extractDueTime(fullText) || '',
      solicitationNumber: extractSolicitationNumber(fullText) || '',
      projectNumber: extractProjectNumber(fullText) || '',
      projectName: extractProjectName(fullText) || '',
      projectDescription: extractProjectDescription(fullText) || '',
      projectSchedule: extractProjectSchedule(fullText) || '',
      soqRequirements: extractSOQRequirements(fullText) || '',
      contentRequirements: extractContentRequirements(fullText) || '',
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      metadata: {
        fileName: file.name,
        fileSize: String(file.size),
        pageCount: Number(pdf.numPages),
        mimeType: file.type || 'application/pdf'
      },
      status: 'processed'
    };

    // Validate required fields
    if (!proposalInfo.solicitationNumber && !proposalInfo.projectNumber) {
      console.warn('No solicitation or project number found in document');
    }

    try {
      // Store in Firestore with proper error handling
      const proposalsRef = collection(db, 'users', userId, 'proposals');
      const docRef = await addDoc(proposalsRef, proposalInfo);
      console.log('Document stored in Firestore with ID:', docRef.id);

      return {
        id: docRef.id,
        ...proposalInfo,
        error: null
      };
    } catch (firestoreError) {
      console.error('Error storing document in Firestore:', firestoreError);
      // Return the extracted info even if Firestore storage fails
      return {
        id: null,
        ...proposalInfo,
        error: 'Failed to store in database',
        errorDetails: firestoreError.message
      };
    }
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}; 