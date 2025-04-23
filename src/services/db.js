import { openDB, deleteDB } from 'idb';

const DB_NAME = 'buildiqDB';
const DB_VERSION = 2;

// Mock implementation for testing
const mockDB = {
  projects: new Map(),
  bids: new Map(),
  equipment: new Map(),
  userProfile: new Map(),
  proposals: new Map(),
};

const isTestEnvironment = process.env.NODE_ENV === 'test';

// Function to delete the database if needed
export async function resetDatabase() {
  try {
    await deleteDB(DB_NAME);
    console.log('Database deleted successfully');
    // Reload the page to reinitialize the database
    window.location.reload();
  } catch (error) {
    console.error('Error deleting database:', error);
  }
}

const dbPromise = isTestEnvironment
  ? Promise.resolve(mockDB)
  : openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);
        
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

        // Always create proposals store in version 2
        if (oldVersion < 2) {
          console.log('Creating proposals store...');
          const proposalStore = db.createObjectStore('proposals', { keyPath: 'id' });
          proposalStore.createIndex('userId', 'userId');
          proposalStore.createIndex('createdAt', 'createdAt');
          proposalStore.createIndex('attachments', 'attachments', { multiEntry: true });
          console.log('Proposals store created successfully');
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

// Proposals
export async function saveProposal(proposal) {
  if (!proposal.id) {
    proposal.id = Date.now().toString();
  }
  
  // Initialize attachments array if it doesn't exist
  if (!proposal.attachments) {
    proposal.attachments = [];
  }
  
  const db = await dbPromise;
  if (isTestEnvironment) {
    mockDB.proposals.set(proposal.id, proposal);
    return proposal;
  }
  const tx = db.transaction('proposals', 'readwrite');
  const store = tx.objectStore('proposals');
  await store.put(proposal);
  await tx.done;
  return proposal;
}

export async function getProposal(id) {
  const db = await dbPromise;
  if (isTestEnvironment) {
    return mockDB.proposals.get(id);
  }
  return db.get('proposals', id);
}

export async function getAllProposals() {
  const db = await dbPromise;
  if (isTestEnvironment) {
    return Array.from(mockDB.proposals.values());
  }
  return db.getAllFromIndex('proposals', 'createdAt');
}

export async function getProposalsByUser(userId) {
  const db = await dbPromise;
  if (isTestEnvironment) {
    return Array.from(mockDB.proposals.values())
      .filter(proposal => proposal.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return db.getAllFromIndex('proposals', 'userId', userId);
}

export async function deleteProposal(id) {
  const db = await dbPromise;
  if (isTestEnvironment) {
    mockDB.proposals.delete(id);
    return;
  }
  await db.delete('proposals', id);
}

export async function addAttachmentToProposal(proposalId, file) {
  const db = await dbPromise;
  const proposal = await getProposal(proposalId);
  
  if (!proposal) {
    throw new Error('Proposal not found');
  }

  const attachment = {
    id: Date.now().toString(),
    name: file.name,
    type: file.type,
    size: file.size,
    data: await file.arrayBuffer(),
    uploadedAt: new Date().toISOString()
  };

  if (!proposal.attachments) {
    proposal.attachments = [];
  }
  
  proposal.attachments.push(attachment);
  proposal.updatedAt = new Date().toISOString();

  if (isTestEnvironment) {
    mockDB.proposals.set(proposal.id, proposal);
    return proposal;
  }

  const tx = db.transaction('proposals', 'readwrite');
  const store = tx.objectStore('proposals');
  await store.put(proposal);
  await tx.done;
  return proposal;
}

export async function removeAttachmentFromProposal(proposalId, attachmentId) {
  const db = await dbPromise;
  const proposal = await getProposal(proposalId);
  
  if (!proposal) {
    throw new Error('Proposal not found');
  }

  if (!proposal.attachments) {
    return proposal;
  }

  proposal.attachments = proposal.attachments.filter(att => att.id !== attachmentId);
  proposal.updatedAt = new Date().toISOString();

  if (isTestEnvironment) {
    mockDB.proposals.set(proposal.id, proposal);
    return proposal;
  }

  const tx = db.transaction('proposals', 'readwrite');
  const store = tx.objectStore('proposals');
  await store.put(proposal);
  await tx.done;
  return proposal;
}