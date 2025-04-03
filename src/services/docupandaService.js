import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from '../config.js';

// Initialize services using the existing Firebase app
const storage = getStorage(app);
const db = getFirestore(app);

// Get the API key from environment variables or use a fallback
const DOCUPANDA_API_KEY = process.env.REACT_APP_DOCUPANDA_API_KEY || 'l45nUglczgYCBT3rF0fHs5Cerkt2';

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

// Helper function to convert file to base64 in chunks
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
};

export const extractProposalInfo = async (file, userId) => {
  try {
    // Check if API key is available
    if (!DOCUPANDA_API_KEY) {
      throw new Error('Docupanda API key is not configured');
    }

    console.log('Using Docupanda API key:', DOCUPANDA_API_KEY);
    
    // Convert file to base64 using FileReader
    const base64File = await fileToBase64(file);

    // First, post the document to Docupanda
    const postResponse = await fetch('https://app.docupanda.io/document', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'X-API-Key': DOCUPANDA_API_KEY
      },
      body: JSON.stringify({
        document: {
          file: {
            contents: base64File,
            filename: file.name
          }
        }
      })
    });

    if (!postResponse.ok) {
      const errorData = await postResponse.json();
      console.error('Docupanda API error:', errorData);
      throw new Error(errorData.message || 'Failed to post document to Docupanda');
    }

    const { documentId } = await postResponse.json();
    console.log('Document posted, ID:', documentId);

    // Wait for processing and get results
    let docupandaResult;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const getResponse = await fetch(`https://app.docupanda.io/document/${documentId}`, {
        headers: {
          'accept': 'application/json',
          'X-API-Key': DOCUPANDA_API_KEY
        }
      });

      if (!getResponse.ok) {
        throw new Error('Failed to get document results from Docupanda');
      }

      const result = await getResponse.json();
      console.log('Docupanda status:', result.status);
      console.log('Docupanda result structure:', JSON.stringify(result, null, 2));

      if (result.status === 'completed') {
        docupandaResult = result;
        break;
      }

      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    if (!docupandaResult) {
      throw new Error('Document processing timed out');
    }

    // Extract text from the result, handling different possible structures
    let fullText = '';
    if (docupandaResult.result && docupandaResult.result.pagesText) {
      fullText = docupandaResult.result.pagesText.join('\n');
    } else if (docupandaResult.result && docupandaResult.result.text) {
      fullText = docupandaResult.result.text;
    } else if (docupandaResult.text) {
      fullText = docupandaResult.text;
    } else {
      console.error('Unexpected Docupanda result structure:', docupandaResult);
      throw new Error('Unexpected Docupanda result structure');
    }

    console.log('Extracted text length:', fullText.length);

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
      userId,
      createdAt: new Date().toISOString(),
      metadata: docupandaResult.result?.metadata || {},
      pagesText: docupandaResult.result?.pagesText || [],
      rawResult: docupandaResult // Store the raw result for debugging
    };

    // Store the processed document in Firebase Storage
    const storageRef = ref(storage, `solicitations/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    proposalInfo.fileUrl = downloadURL;

    // Store in Firestore
    const docRef = await addDoc(collection(db, 'proposals'), proposalInfo);

    return {
      id: docRef.id,
      ...proposalInfo
    };
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}; 