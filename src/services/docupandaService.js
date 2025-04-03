import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../config.js';

// Initialize Firestore using the existing Firebase app
const db = getFirestore(app);

// Get the API key from environment variables or use a fallback
const DOCUPANDA_API_KEY = process.env.REACT_APP_DOCUPANDA_API_KEY || 'l45nUglczgYCBT3rF0fHs5Cerkt2';
const DOCUPANDA_SCHEMA_ID = '4ad88272';

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

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Using Docupanda API key:', DOCUPANDA_API_KEY);
    
    // Convert file to base64 using FileReader
    const base64File = await fileToBase64(file);

    // First, post the document to Docupanda with the schema ID
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
          },
          schemaId: DOCUPANDA_SCHEMA_ID
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

    // Extract information from the schema-based result
    const extractedData = docupandaResult.result.extractedData || {};
    
    // Create proposal info from the extracted data
    const proposalInfo = {
      dueDate: extractedData.dueDate || null,
      dueTime: extractedData.dueTime || null,
      solicitationNumber: extractedData.solicitationNumber || null,
      projectNumber: extractedData.projectNumber || null,
      projectName: extractedData.projectName || null,
      projectDescription: extractedData.projectDescription || null,
      projectSchedule: extractedData.projectSchedule || null,
      soqRequirements: extractedData.soqRequirements || null,
      contentRequirements: extractedData.contentRequirements || null,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      metadata: docupandaResult.result.metadata || {},
      docupandaId: documentId,
      status: 'processed'
    };

    try {
      // Store in Firestore
      const proposalsRef = collection(db, 'users', userId, 'proposals');
      const docRef = await addDoc(proposalsRef, proposalInfo);
      console.log('Document stored in Firestore with ID:', docRef.id);

      return {
        id: docRef.id,
        ...proposalInfo
      };
    } catch (firestoreError) {
      console.error('Error storing document in Firestore:', firestoreError);
      // Return the extracted info even if Firestore storage fails
      return {
        id: null,
        ...proposalInfo
      };
    }
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}; 