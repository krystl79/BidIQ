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
    await processSolicitation({
      fileUrl: downloadURL,
      filename: filename,
      fileType: file.type,
      userId: userId
    });

    // Create a proposal entry in Firestore
    const proposalRef = await addDoc(collection(db, 'proposals'), {
      userId,
      filename,
      fileType: file.type,
      fileUrl: downloadURL,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return {
      id: proposalRef.id,
      filename,
      fileType: file.type,
      fileUrl: downloadURL
    };
  } catch (error) {
    console.error('Error uploading solicitation:', error);
    throw new Error('Failed to upload solicitation. Please try again.');
  }
};

export const processSolicitationLink = async (link, userId) => {
  try {
    // Call the Cloud Function to process the link
    const processSolicitationLink = httpsCallable(functions, 'processSolicitationLink');
    await processSolicitationLink({
      link: link,
      userId: userId
    });

    // Create a proposal entry in Firestore
    const proposalRef = await addDoc(collection(db, 'proposals'), {
      userId,
      link,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return {
      id: proposalRef.id,
      link
    };
  } catch (error) {
    console.error('Error processing solicitation link:', error);
    throw new Error('Failed to process solicitation link. Please try again.');
  }
}; 