import { storage } from './firebase';

import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
/**
 * Upload image file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path prefix
 * @returns {Promise<string>} - Download URL
 */
export const uploadImage = async (file, path = 'images') => {
  try {
    if (!file) throw new Error('No file provided');
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit.');
    }
    
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${getFileType(file)}`;
    const storagePath = `${path}/${fileName}`;
    const fileRef = storageRef(storage, storagePath);
    
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Upload image error:', error);
    throw error;
  }
};

/**
 * Upload PDF/document file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - Storage path prefix
 * @returns {Promise<string>} - Download URL
 */
export const uploadDocument = async (file, path = 'documents') => {
  try {
    if (!file) throw new Error('No file provided');
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PDF and Word documents are allowed.');
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit.');
    }
    
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
    const storagePath = `${path}/${fileName}`;
    const fileRef = storageRef(storage, storagePath);
    
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Upload document error:', error);
    throw error;
  }
};

/**
 * Delete file from Firebase Storage
 * @param {string} url - The download URL of the file
 * @returns {Promise<void>}
 */
export const deleteFile = async (url) => {
  try {
    if (!url) return;
    
    const fileRef = storageRef(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Delete file error:', error);
    throw error;
  }
};

/**
 * Get file type extension
 * @param {File} file 
 * @returns {string}
 */
const getFileType = (file) => {
  switch (file.type) {
    case 'image/jpeg': return '.jpg';
    case 'image/png': return '.png';
    case 'image/webp': return '.webp';
    case 'image/gif': return '.gif';
    default: return '.jpg';
  }
};

/**
 * Preview image from file input
 * @param {File} file 
 * @returns {Promise<string>} - Data URL for preview
 */
export const previewImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export default {
  uploadImage,
  uploadDocument,
  deleteFile,
  previewImage
};
