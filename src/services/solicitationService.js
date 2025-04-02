import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

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

    return result.data;
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
    return result.data;
  } catch (error) {
    console.error('Error processing solicitation link:', error);
    throw new Error('Failed to process solicitation link. Please try again.');
  }
}; 