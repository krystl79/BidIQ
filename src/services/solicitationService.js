import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';
import { app } from '../firebase/config';
import { getFunctions, httpsCallable } from 'firebase/functions';

const db = getFirestore(app);
const functions = getFunctions(app);

export const uploadSolicitation = async (file, userId) => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const storageRef = ref(storage, `solicitations/${userId}/${filename}`);

    // Upload the file with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        userId: userId
      }
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Call the Cloud Function to process the document
    const processSolicitation = httpsCallable(functions, 'processSolicitation');
    const result = await processSolicitation({
      fileUrl: downloadURL,
      filename: filename,
      fileType: file.type,
      userId: userId
    });

    if (!result.data.success) {
      throw new Error(result.data.error || 'Failed to process solicitation');
    }

    // Create a proposal entry in Firestore
    const proposalRef = await addDoc(collection(db, 'proposals'), {
      userId,
      filename,
      fileType: file.type,
      fileUrl: downloadURL,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      solicitationId: result.data.solicitationId
    });

    return {
      id: proposalRef.id,
      filename,
      fileType: file.type,
      fileUrl: downloadURL,
      solicitationId: result.data.solicitationId
    };
  } catch (error) {
    console.error('Error uploading solicitation:', error);
    if (error.code === 'functions/internal') {
      throw new Error(error.message || 'Failed to process solicitation. Please try again.');
    }
    throw new Error('Failed to upload solicitation. Please try again.');
  }
};

export const processSolicitationLink = async (link, userId) => {
  try {
    // Call the Cloud Function to process the link
    const processSolicitationLink = httpsCallable(functions, 'processSolicitationLink');
    const result = await processSolicitationLink({
      link: link,
      userId: userId
    });

    if (!result.data.success) {
      throw new Error(result.data.error || 'Failed to process solicitation link');
    }

    // Create a proposal entry in Firestore
    const proposalRef = await addDoc(collection(db, 'proposals'), {
      userId,
      link,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      solicitationId: result.data.solicitationId
    });

    return {
      id: proposalRef.id,
      link,
      solicitationId: result.data.solicitationId
    };
  } catch (error) {
    console.error('Error processing solicitation link:', error);
    if (error.code === 'functions/internal') {
      throw new Error(error.message || 'Failed to process solicitation link. Please try again.');
    }
    throw new Error('Failed to process solicitation link. Please try again.');
  }
};

export const createProposal = async (proposalData) => {
  try {
    const proposalsRef = collection(db, 'proposals');
    const newProposalRef = await addDoc(proposalsRef, proposalData);
    
    return {
      id: newProposalRef.id,
      ...proposalData
    };
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw new Error('Failed to create proposal');
  }
}; 