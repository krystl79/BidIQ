const { initializeApp } = require('firebase/app');
const { getAuth, deleteUser, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, query, where, getDocs, deleteDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyDzPythGxO-KWPahujX65KxUQOqj8Rux6M',
  authDomain: 'bidiq-8a697.firebaseapp.com',
  projectId: 'bidiq-8a697',
  storageBucket: 'bidiq-8a697.firebasestorage.app',
  messagingSenderId: '985256787837',
  appId: '1:985256787837:web:84c74b2c606c8845025614'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function deleteUserAndData(email) {
  try {
    // Delete from users collection
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    const userDeletions = [];
    
    querySnapshot.forEach((doc) => {
      userDeletions.push(deleteDoc(doc.ref));
    });
    await Promise.all(userDeletions);
    console.log(`Checked users collection for ${email}`);

    // Delete from projects collection
    const projectsRef = collection(db, 'projects');
    const projectsQuery = query(projectsRef, where('userId', '==', email));
    const projectsSnapshot = await getDocs(projectsQuery);
    const projectDeletions = [];
    
    projectsSnapshot.forEach((doc) => {
      projectDeletions.push(deleteDoc(doc.ref));
    });
    await Promise.all(projectDeletions);
    console.log(`Checked projects collection for ${email}`);

    // Delete from profiles collection
    const profilesRef = collection(db, 'profiles');
    const profilesQuery = query(profilesRef, where('email', '==', email));
    const profilesSnapshot = await getDocs(profilesQuery);
    const profileDeletions = [];
    
    profilesSnapshot.forEach((doc) => {
      profileDeletions.push(deleteDoc(doc.ref));
    });
    await Promise.all(profileDeletions);
    console.log(`Checked profiles collection for ${email}`);

    // Delete from userProfile collection
    const userProfileRef = collection(db, 'userProfile');
    const userProfileQuery = query(userProfileRef, where('email', '==', email));
    const userProfileSnapshot = await getDocs(userProfileQuery);
    const userProfileDeletions = [];
    
    userProfileSnapshot.forEach((doc) => {
      userProfileDeletions.push(deleteDoc(doc.ref));
    });
    await Promise.all(userProfileDeletions);
    console.log(`Checked userProfile collection for ${email}`);

    console.log(`Successfully processed all collections for ${email}`);
  } catch (error) {
    console.error(`Error clearing data for ${email}:`, error);
  }
}

async function clearProfiles() {
  const emails = ['krystlynn@gmail.com', 'reginaldthimothee@gmail.com'];
  
  try {
    for (const email of emails) {
      await deleteUserAndData(email);
    }
    console.log('Profile cleanup completed');
  } catch (error) {
    console.error('Error in clearProfiles:', error);
  } finally {
    process.exit(0);
  }
}

clearProfiles(); 