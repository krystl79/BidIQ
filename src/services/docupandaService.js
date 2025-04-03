import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config.js';

// Initialize services using the existing Firebase app
const storage = getStorage(app);
const db = getFirestore(app);
const functions = getFunctions(app);

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
    // First, process the file with Docupanda through Cloud Function
    const processDocument = httpsCallable(functions, 'processDocument');
    const formData = new FormData();
    formData.append('file', file);
    
    const { data: docupandaResult } = await processDocument(formData);
    const fullText = docupandaResult.text || '';

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
      metadata: docupandaResult.metadata || {},
      tables: docupandaResult.tables || [],
      forms: docupandaResult.forms || []
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