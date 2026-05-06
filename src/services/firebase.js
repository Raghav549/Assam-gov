// ============================================
// FIREBASE CONFIGURATION & SERVICES (CORRECTED)
// ============================================

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Firebase configuration - Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDemoKeyReplaceWithYourActualKey",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "youth-assam.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "youth-assam-project",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "youth-assam.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ============================================
// COLLECTION REFERENCES
// ============================================

export const usersCollection = collection(db, 'users');
export const postsCollection = collection(db, 'posts');
export const scholarshipsCollection = collection(db, 'scholarships');
export const coursesCollection = collection(db, 'courses');
export const helpRequestsCollection = collection(db, 'helpRequests');
export const donationsCollection = collection(db, 'donations');
export const govtWorksCollection = collection(db, 'govtWorks');
// FIXED TYPO HERE: Added 'export const'
export const govtIssuesCollection = collection(db, 'govtIssues');
export const notificationsCollection = collection(db, 'notifications');
export const commentsCollection = collection(db, 'comments');

// ============================================
// AUTH SERVICES
// ============================================

export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateFirebaseProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await addDoc(usersCollection, {
      uid: userCredential.user.uid,
      email,
      displayName,
      role: 'student',
      profilePicture: null,
      bio: '',
      location: '',
      phone: '',
      educationLevel: '',
      interests: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isVerified: false,
      isActive: true
    });
    
    return userCredential.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ============================================
// USER SERVICES
// ============================================

export const getUserById = async (uid) => {
  try {
    const q = query(usersCollection, where('uid', '==', uid));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, data) => {
  try {
    const q = query(usersCollection, where('uid', '==', userId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const userDocRef = doc(db, 'users', snapshot.docs[0].id);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(query(usersCollection, orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const q = query(usersCollection, where('uid', '==', userId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const userDocRef = doc(db, 'users', snapshot.docs[0].id);
      await updateDoc(userDocRef, { role, updatedAt: serverTimestamp() });
    }
  } catch (error) {
    console.error('Update role error:', error);
    throw error;
  }
};

export const toggleUserActive = async (userId, isActive) => {
  try {
    const q = query(usersCollection, where('uid', '==', userId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const userDocRef = doc(db, 'users', snapshot.docs[0].id);
      await updateDoc(userDocRef, { isActive, updatedAt: serverTimestamp() });
    }
  } catch (error) {
    console.error('Toggle active error:', error);
    throw error;
  }
};

// ============================================
// POST SERVICES
// ============================================

export const createPost = async (postData) => {
  try {
    const post = await addDoc(postsCollection, {
      ...postData,
      likes: [],
      likeCount: 0,
      commentCount: 0,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return post;
  } catch (error) {
    console.error('Create post error:', error);
    throw error;
  }
};

export const getAllPosts = async (category = null) => {
  try {
    let q;
    if (category) {
      q = query(
        postsCollection, 
        where('status', '==', 'approved'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        postsCollection, 
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get posts error:', error);
    throw error;
  }
};

export const getPendingPosts = async () => {
  try {
    const snapshot = await getDocs(query(
      postsCollection, 
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    ));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get pending posts error:', error);
    throw error;
  }
};

export const approvePost = async (postId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { status: 'approved', updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Approve post error:', error);
    throw error;
  }
};

export const rejectPost = async (postId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { status: 'rejected', updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Reject post error:', error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error) {
    console.error('Delete post error:', error);
    throw error;
  }
};

export const likePost = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: arrayUnion(userId),
      likeCount: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Like post error:', error);
    throw error;
  }
};

export const unlikePost = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: arrayRemove(userId),
      likeCount: increment(-1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    throw error;
  }
};

// ============================================
// COMMENT SERVICES
// ============================================

export const addComment = async (postId, commentData) => {
  try {
    const comment = await addDoc(commentsCollection, {
      ...commentData,
      postId,
      createdAt: serverTimestamp()
    });
    
    // Update post comment count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(1),
      updatedAt: serverTimestamp()
    });
    
    return comment;
  } catch (error) {
    console.error('Add comment error:', error);
    throw error;
  }
};

export const getCommentsByPost = async (postId) => {
  try {
    const snapshot = await getDocs(query(
      commentsCollection,
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    ));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get comments error:', error);
    throw error;
  }
};

// ============================================
// SCHOLARSHIP SERVICES
// ============================================

export const createScholarship = async (scholarshipData) => {
  try {
    const scholarship = await addDoc(scholarshipsCollection, {
      ...scholarshipData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return scholarship;
  } catch (error) {
    console.error('Create scholarship error:', error);
    throw error;
  }
};

export const getAllScholarships = async (filters = {}) => {
  try {
    let q = query(scholarshipsCollection, orderBy('deadline', 'asc'));
    
    if (filters.country) {
      q = query(scholarshipsCollection, 
        where('country', '==', filters.country),
        orderBy('deadline', 'asc')
      );
    }
    
    if (filters.category) {
      q = query(scholarshipsCollection, 
        where('category', '==', filters.category),
        orderBy('deadline', 'asc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get scholarships error:', error);
    throw error;
  }
};

export const getScholarshipById = async (id) => {
  try {
    const docRef = doc(db, 'scholarships', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Get scholarship error:', error);
    throw error;
  }
};

export const updateScholarship = async (id, data) => {
  try {
    const scholarshipRef = doc(db, 'scholarships', id);
    await updateDoc(scholarshipRef, { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Update scholarship error:', error);
    throw error;
  }
};

export const deleteScholarship = async (id) => {
  try {
    await deleteDoc(doc(db, 'scholarships', id));
  } catch (error) {
    console.error('Delete scholarship error:', error);
    throw error;
  }
};

// ============================================
// COURSE SERVICES
// ============================================

export const createCourse = async (courseData) => {
  try {
    const course = await addDoc(coursesCollection, {
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return course;
  } catch (error) {
    console.error('Create course error:', error);
    throw error;
  }
};

export const getAllCourses = async (category = null) => {
  try {
    let q;
    if (category) {
      q = query(coursesCollection, where('category', '==', category));
    } else {
      q = query(coursesCollection, orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get courses error:', error);
    throw error;
  }
};

export const updateCourse = async (id, data) => {
  try {
    const courseRef = doc(db, 'courses', id);
    await updateDoc(courseRef, { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Update course error:', error);
    throw error;
  }
};

export const deleteCourse = async (id) => {
  try {
    await deleteDoc(doc(db, 'courses', id));
  } catch (error) {
    console.error('Delete course error:', error);
    throw error;
  }
};

// ============================================
// HELP REQUEST SERVICES
// ============================================

export const createHelpRequest = async (requestData) => {
  try {
    const request = await addDoc(helpRequestsCollection, {
      ...requestData,
      status: 'pending',
      adminReply: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return request;
  } catch (error) {
    console.error('Create help request error:', error);
    throw error;
  }
};

export const getHelpRequests = async (status = null) => {
  try {
    let q;
    if (status) {
      q = query(helpRequestsCollection, where('status', '==', status), orderBy('createdAt', 'desc'));
    } else {
      q = query(helpRequestsCollection, orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get help requests error:', error);
    throw error;
  }
};

export const replyToHelpRequest = async (requestId, reply) => {
  try {
    const requestRef = doc(db, 'helpRequests', requestId);
    await updateDoc(requestRef, {
      adminReply: reply,
      status: 'resolved',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Reply to help request error:', error);
    throw error;
  }
};

export const updateHelpRequestStatus = async (requestId, status) => {
  try {
    const requestRef = doc(db, 'helpRequests', requestId);
    await updateDoc(requestRef, { status, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Update help request status error:', error);
    throw error;
  }
};

// ============================================
// DONATION SERVICES
// ============================================

export const createDonationRequest = async (donationData) => {
  try {
    const donation = await addDoc(donationsCollection, {
      ...donationData,
      status: 'pending',
      totalRaised: 0,
      donors: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return donation;
  } catch (error) {
    console.error('Create donation request error:', error);
    throw error;
  }
};

export const getDonationRequests = async (status = null) => {
  try {
    let q;
    if (status) {
      q = query(donationsCollection, where('status', '==', status), orderBy('createdAt', 'desc'));
    } else {
      q = query(donationsCollection, orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get donation requests error:', error);
    throw error;
  }
};

export const approveDonationRequest = async (donationId) => {
  try {
    const donationRef = doc(db, 'donations', donationId);
    await updateDoc(donationRef, { status: 'approved', updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Approve donation error:', error);
    throw error;
  }
};

export const rejectDonationRequest = async (donationId) => {
  try {
    const donationRef = doc(db, 'donations', donationId);
    await updateDoc(donationRef, { status: 'rejected', updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Reject donation error:', error);
    throw error;
  }
};

export const recordDonation = async (donationId, donorData) => {
  try {
    const donationRef = doc(db, 'donations', donationId);
    await updateDoc(donationRef, {
      totalRaised: increment(donorData.amount),
      donors: arrayUnion({
        uid: donorData.uid,
        name: donorData.name,
        amount: donorData.amount,
        message: donorData.message,
        timestamp: serverTimestamp()
      }),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Record donation error:', error);
    throw error;
  }
};

// ============================================
// GOVERNMENT WORK SERVICES
// ============================================

export const createGovtWork = async (workData) => {
  try {
    const work = await addDoc(govtWorksCollection, {
      ...workData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return work;
  } catch (error) {
    console.error('Create govt work error:', error);
    throw error;
  }
};

export const getAllGovtWorks = async (status = null) => {
  try {
    let q;
    if (status) {
      q = query(govtWorksCollection, where('status', '==', status), orderBy('createdAt', 'desc'));
    } else {
      q = query(govtWorksCollection, orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get govt works error:', error);
    throw error;
  }
};

export const updateGovtWork = async (id, data) => {
  try {
    const workRef = doc(db, 'govtWorks', id);
    await updateDoc(workRef, { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Update govt work error:', error);
    throw error;
  }
};

export const deleteGovtWork = async (id) => {
  try {
    await deleteDoc(doc(db, 'govtWorks', id));
  } catch (error) {
    console.error('Delete govt work error:', error);
    throw error;
  }
};

// ============================================
// GOVERNMENT ISSUE SERVICES
// ============================================

export const reportGovtIssue = async (issueData) => {
  try {
    const issue = await addDoc(govtIssuesCollection, {
      ...issueData,
      status: 'reported',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return issue;
  } catch (error) {
    console.error('Report govt issue error:', error);
    throw error;
  }
};

export const getGovtIssues = async (status = null) => {
  try {
    let q;
    if (status) {
      q = query(govtIssuesCollection, where('status', '==', status), orderBy('createdAt', 'desc'));
    } else {
      q = query(govtIssuesCollection, orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get govt issues error:', error);
    throw error;
  }
};

// ============================================
// NOTIFICATION SERVICES
// ============================================

export const createNotification = async (notificationData) => {
  try {
    const notification = await addDoc(notificationsCollection, {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp()
    });
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId) => {
  try {
    const snapshot = await getDocs(query(
      notificationsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    ));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get user notifications error:', error);
    throw error;
  }
};

export const markNotificationRead = async (notificationId) => {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { read: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    throw error;
  }
};

export const markAllNotificationsRead = async (userId) => {
  try {
    const snapshot = await getDocs(query(
      notificationsCollection,
      where('userId', '==', userId),
      where('read', '==', false)
    ));
    const batch = [];
    snapshot.docs.forEach(docSnap => {
      batch.push(updateDoc(doc(db, 'notifications', docSnap.id), { read: true }));
    });
    await Promise.all(batch);
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    throw error;
  }
};

export const getUnreadCount = async (userId) => {
  try {
    const snapshot = await getDocs(query(
      notificationsCollection,
      where('userId', '==', userId),
      where('read', '==', false)
    ));
    return snapshot.size;
  } catch (error) {
    console.error('Get unread count error:', error);
    return 0;
  }
};

// ============================================
// REAL-TIME LISTENERS
// ============================================

export const subscribeToPosts = (callback) => {
  const q = query(
    postsCollection,
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(posts);
  });
};

export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    notificationsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(notifications);
  });
};

export default {
  // Auth
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  onAuthStateChange,
  
  // Users
  getUserById,
  updateUserProfile,
  getAllUsers,
  updateUserRole,
  toggleUserActive,
  
  // Posts
  createPost,
  getAllPosts,
  getPendingPosts,
  approvePost,
  rejectPost,
  deletePost,
  likePost,
  unlikePost,
  
  // Comments
  addComment,
  getCommentsByPost,
  
  // Scholarships
  createScholarship,
  getAllScholarships,
  getScholarshipById,
  updateScholarship,
  deleteScholarship,
  
  // Courses
  createCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
  
  // Help Requests
  createHelpRequest,
  getHelpRequests,
  replyToHelpRequest,
  updateHelpRequestStatus,
  
  // Donations
  createDonationRequest,
  getDonationRequests,
  approveDonationRequest,
  rejectDonationRequest,
  recordDonation,
  
  // Govt Works
  createGovtWork,
  getAllGovtWorks,
  updateGovtWork,
  deleteGovtWork,
  
  // Govt Issues
  reportGovtIssue,
  getGovtIssues,
  
  // Notifications
  createNotification,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  
  // Real-time
  subscribeToPosts,
  subscribeToNotifications
};
