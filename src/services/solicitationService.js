import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';
import { app } from '../firebase/config';
import { getAuth } from 'firebase/auth';

const db = getFirestore(app);

const getAuthToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  return user.getIdToken();
};

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

    // Get the auth token
    const authToken = await getAuthToken();

    // Call the Cloud Function to process the document
    const response = await fetch('https://us-central1-bidiq-8a697.cloudfunctions.net/processSolicitation', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        fileUrl: downloadURL,
        filename: filename,
        fileType: file.type,
        userId: userId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process solicitation');
    }

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
    // Get the auth token
    const authToken = await getAuthToken();

    // Call the Cloud Function to process the link
    const response = await fetch('https://us-central1-bidiq-8a697.cloudfunctions.net/processSolicitationLink', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        link: link,
        userId: userId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process solicitation link');
    }

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