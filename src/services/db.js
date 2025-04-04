import { openDB } from 'idb';
import { collection, query, orderBy, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth } from 'firebase/auth';

const DB_NAME = 'buildiqDB';
const DB_VERSION = 1;

// Mock implementation for testing
const mockDB = {
  projects: new Map(),
  bids: new Map(),
  equipment: new Map(),
  userProfile: new Map(),
};

const isTestEnvironment = process.env.NODE_ENV === 'test';

const dbPromise = isTestEnvironment
  ? Promise.resolve(mockDB)
  : openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('createdAt', 'createdAt');
        }
        
        if (!db.objectStoreNames.contains('bids')) {
          const bidStore = db.createObjectStore('bids', { keyPath: 'id' });
          bidStore.createIndex('projectId', 'projectId');
          bidStore.createIndex('createdAt', 'createdAt');
        }

        if (!db.objectStoreNames.contains('equipment')) {
          const equipmentStore = db.createObjectStore('equipment', { keyPath: 'id' });
          equipmentStore.createIndex('type', 'type');
        }

        if (!db.objectStoreNames.contains('userProfile')) {
          db.createObjectStore('userProfile', { keyPath: 'id' });
        }
      },
    });

// Projects
export async function saveProject(project) {
  const db = await dbPromise;
  if (isTestEnvironment) {
    mockDB.projects.set(project.id, project);
    return project;
  }
  const tx = db.transaction('projects', 'readwrite');
  const store = tx.objectStore('projects');
  await store.put(project);
  await tx.done;
  return project;
}

export async function updateProject(id, projectData) {
  const db = await dbPromise;
  if (isTestEnvironment) {
    const existingProject = mockDB.projects.get(id);
    if (!existingProject) {
      throw new Error('Project not found');
    }
    const updatedProject = {
      ...existingProject,
      ...projectData,
      id: existingProject.id,
      createdAt: existingProject.createdAt,
      updatedAt: new Date().toISOString()
    };
    mockDB.projects.set(id, updatedProject);
    return updatedProject;
  }
  const tx = db.transaction('projects', 'readwrite');
  const store = tx.objectStore('projects');
  
  const existingProject = await store.get(id);
  if (!existingProject) {
    throw new Error('Project not found');
  }

  const updatedProject = {
    ...existingProject,
    ...projectData,
    id: existingProject.id,
    createdAt: existingProject.createdAt,
    updatedAt: new Date().toISOString()
  };

  await store.put(updatedProject);
  await tx.done;
  return updatedProject;
}

export async function getProject(id) {
  const db = await dbPromise;
  if (isTestEnvironment) {
    return mockDB.projects.get(id);
  }
  return db.get('projects', id);
}

export async function getAllProjects() {
  const db = await dbPromise;
  if (isTestEnvironment) {
    return Array.from(mockDB.projects.values());
  }
  return db.getAllFromIndex('projects', 'createdAt');
}

export async function deleteProject(id) {
  const db = await dbPromise;
  if (isTestEnvironment) {
    mockDB.projects.delete(id);
    // Delete associated bids
    for (const [bidId, bid] of mockDB.bids.entries()) {
      if (bid.projectId === id) {
        mockDB.bids.delete(bidId);
      }
    }
    return;
  }
  const tx = db.transaction(['projects', 'bids'], 'readwrite');
  
  const bidStore = tx.objectStore('bids');
  const bids = await bidStore.index('projectId').getAll(id);
  await Promise.all(bids.map(bid => bidStore.delete(bid.id)));
  
  await tx.objectStore('projects').delete(id);
  await tx.done;
}

// Bids
export async function saveBid(bid) {
  const db = await dbPromise;
  if (isTestEnvironment) {
    mockDB.bids.set(bid.id, bid);
    return bid;
  }
  const tx = db.transaction('bids', 'readwrite');
  const store = tx.objectStore('bids');
  await store.put(bid);
  await tx.done;
  return bid;
}

export async function getBid(id) {
  const db = await dbPromise;
  if (isTestEnvironment) {
    return mockDB.bids.get(id);
  }
  return db.get('bids', id);
}

export async function getAllBids() {
  const db = await dbPromise;
  if (isTestEnvironment) {
    return Array.from(mockDB.bids.values());
  }
  return db.getAllFromIndex('bids', 'createdAt');
}

export async function getBidsByProject(projectId) {
  const db = await dbPromise;
  if (isTestEnvironment) {
    return Array.from(mockDB.bids.values()).filter(bid => bid.projectId === projectId);
  }
  return db.getAllFromIndex('bids', 'projectId', projectId);
}

export async function deleteBid(id) {
  const db = await dbPromise;
  if (isTestEnvironment) {
    mockDB.bids.delete(id);
    return;
  }
  await db.delete('bids', id);
}

// Equipment
export async function saveEquipment(equipment) {
  const db = await dbPromise;
  if (isTestEnvironment) {
    mockDB.equipment.set(equipment.id, equipment);
    return equipment;
  }
  const tx = db.transaction('equipment', 'readwrite');
  const store = tx.objectStore('equipment');
  await store.put(equipment);
  await tx.done;
  return equipment;
}

export async function getAllEquipment() {
  const db = await dbPromise;
  if (isTestEnvironment) {
    return Array.from(mockDB.equipment.values());
  }
  return db.getAll('equipment');
}

export async function getEquipmentByType(type) {
  const db = await dbPromise;
  if (isTestEnvironment) {
    return Array.from(mockDB.equipment.values()).filter(item => item.type === type);
  }
  return db.getAllFromIndex('equipment', 'type', type);
}

// User Profile
export async function saveUserProfile(profile) {
  const db = await dbPromise;
  if (isTestEnvironment) {
    mockDB.userProfile.set('current', { ...profile, id: 'current' });
    return profile;
  }
  await db.put('userProfile', { ...profile, id: 'current' });
  return profile;
}

export async function getUserProfile() {
  const db = await dbPromise;
  if (isTestEnvironment) {
    return mockDB.userProfile.get('current');
  }
  return db.get('userProfile', 'current');
}

// Utility function to initialize the database with sample data if needed
export async function initializeDB(sampleData) {
  if (sampleData.userProfile) {
    await saveUserProfile(sampleData.userProfile);
  }
  
  if (sampleData.equipment) {
    await Promise.all(sampleData.equipment.map(item => saveEquipment(item)));
  }
  
  if (sampleData.projects) {
    await Promise.all(sampleData.projects.map(project => saveProject(project)));
  }
  
  if (sampleData.bids) {
    await Promise.all(sampleData.bids.map(bid => saveBid(bid)));
  }
}

// RFP Response Functions
export const getAllRFPResponses = async () => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to access RFP responses');
    }

    const responsesRef = collection(db, 'rfpResponses');
    const q = query(
      responsesRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting RFP responses:', error);
    throw error;
  }
};

export const getRFPResponse = async (responseId) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to access RFP response');
    }

    const docRef = doc(db, 'rfpResponses', responseId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Verify the response belongs to the current user
      if (data.userId !== auth.currentUser.uid) {
        throw new Error('Access denied: This response belongs to another user');
      }
      return {
        id: docSnap.id,
        ...data
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting RFP response:', error);
    throw error;
  }
};

export const createRFPResponseFromSolicitation = async (solicitationData) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to create RFP response');
    }

    const responsesRef = collection(db, 'rfpResponses');
    const newResponse = {
      title: solicitationData.fileName || 'Untitled Solicitation',
      solicitationId: solicitationData.id,
      solicitationFile: {
        name: solicitationData.fileName,
        url: solicitationData.fileUrl,
        uploadedAt: solicitationData.uploadedAt
      },
      status: 'New',
      company: '',
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      notes: ''
    };
    
    const docRef = await addDoc(responsesRef, newResponse);
    return docRef.id;
  } catch (error) {
    console.error('Error creating RFP response:', error);
    throw error;
  }
};

export const updateRFPResponse = async (responseId, responseData) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to update RFP response');
    }

    // Verify ownership before update
    const docRef = doc(db, 'rfpResponses', responseId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('RFP response not found');
    }
    
    const data = docSnap.data();
    if (data.userId !== auth.currentUser.uid) {
      throw new Error('Access denied: This response belongs to another user');
    }

    const updatedResponse = {
      ...responseData,
      userId: auth.currentUser.uid, // Ensure userId remains unchanged
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, updatedResponse);
  } catch (error) {
    console.error('Error updating RFP response:', error);
    throw error;
  }
};

export const deleteRFPResponse = async (responseId) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to delete RFP response');
    }

    // Verify ownership before delete
    const docRef = doc(db, 'rfpResponses', responseId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('RFP response not found');
    }
    
    const data = docSnap.data();
    if (data.userId !== auth.currentUser.uid) {
      throw new Error('Access denied: This response belongs to another user');
    }

    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting RFP response:', error);
    throw error;
  }
};

export const getRFPResponsesBySolicitation = async (solicitationId) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to access RFP responses');
    }

    const responsesRef = collection(db, 'rfpResponses');
    const q = query(
      responsesRef, 
      where('userId', '==', auth.currentUser.uid),
      where('solicitationId', '==', solicitationId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting RFP responses by solicitation:', error);
    throw error;
  }
}; 