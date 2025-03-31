import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { storage, functions } from '../firebase/config';

export const uploadSolicitation = async (file, userId) => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${userId}/${timestamp}-${file.name}`;
    const storageRef = ref(storage, `solicitations/${filename}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Call the Cloud Function to process the document
    const processDocument = httpsCallable(functions, 'processSolicitation');
    const result = await processDocument({
      fileUrl: downloadURL,
      filename: file.name,
      fileType: file.type,
      userId: userId
    });

    return result.data;
  } catch (error) {
    console.error('Error uploading solicitation:', error);
    throw error;
  }
};

export const processSolicitationLink = async (link, userId) => {
  try {
    // Call the Cloud Function to process the link
    const processLink = httpsCallable(functions, 'processSolicitationLink');
    const result = await processLink({
      link: link,
      userId: userId
    });

    return result.data;
  } catch (error) {
    console.error('Error processing solicitation link:', error);
    throw error;
  }
}; 