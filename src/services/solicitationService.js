import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import { getFirestore } from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';
import { app } from '../firebase/config';

const db = getFirestore(app);

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

    // Create a proposal entry in Firestore
    const proposalRef = await addDoc(collection(db, 'proposals'), {
      ...result.data.projectData,
      userId,
      solicitationId: result.data.solicitationId,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      file: {
        name: filename,
        url: downloadURL,
        type: file.type,
        uploadedAt: new Date().toISOString()
      }
    });

    return {
      ...result.data.projectData,
      id: proposalRef.id,
      solicitationId: result.data.solicitationId
    };
  } catch (error) {
    console.error('Error uploading solicitation:', error);
    throw new Error('Failed to upload solicitation. Please try again.');
  }
};

export const processSolicitationLink = async (link, userId) => {
  try {
    const processSolicitationLink = httpsCallable(functions, 'processSolicitationLink');
    const result = await processSolicitationLink({
      link: link,
      userId: userId
    });

    // Create a proposal entry in Firestore
    const proposalRef = await addDoc(collection(db, 'proposals'), {
      ...result.data.projectData,
      userId,
      solicitationId: result.data.solicitationId,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      link: {
        url: link,
        processedAt: new Date().toISOString()
      }
    });

    return {
      ...result.data.projectData,
      id: proposalRef.id,
      solicitationId: result.data.solicitationId
    };
  } catch (error) {
    console.error('Error processing solicitation link:', error);
    throw new Error('Failed to process solicitation link. Please try again.');
  }
}; 