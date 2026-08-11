import { supabase } from './firebase';

const BUCKET = 'uploads';

/**
 * Upload an image to Supabase Storage.
 * @param {File} file
 * @param {string} path Storage path prefix
 * @returns {Promise<string>} Public URL
 */
export const uploadImage = async (file, path = 'images') => {
  try {
    if (!file) throw new Error('No file provided');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit.');
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${getFileType(file)}`;
    const storagePath = `${path}/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { upsert: true, contentType: file.type });

    if (error) throw error;

    return getPublicUrl(storagePath);
  } catch (error) {
    console.error('Upload image error:', error);
    throw error;
  }
};

/**
 * Upload a PDF/document to Supabase Storage.
 * @param {File} file
 * @param {string} path Storage path prefix
 * @returns {Promise<string>} Public URL
 */
export const uploadDocument = async (file, path = 'documents') => {
  try {
    if (!file) throw new Error('No file provided');

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PDF and Word documents are allowed.');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit.');
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${getDocumentType(file)}`;
    const storagePath = `${path}/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { upsert: true, contentType: file.type });

    if (error) throw error;

    return getPublicUrl(storagePath);
  } catch (error) {
    console.error('Upload document error:', error);
    throw error;
  }
};

/**
 * Delete a file from Supabase Storage.
 * Accepts a URL returned by uploadImage/uploadDocument or a storage path.
 * @param {string} urlOrPath
 * @returns {Promise<void>}
 */
export const deleteFile = async (urlOrPath) => {
  try {
    if (!urlOrPath) return;

    const storagePath = extractStoragePath(urlOrPath);
    const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Delete file error:', error);
    throw error;
  }
};

const getPublicUrl = (storagePath) => {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
};

const extractStoragePath = (urlOrPath) => {
  if (!urlOrPath.startsWith('http')) return urlOrPath.replace(/^\/+/, '');

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = urlOrPath.indexOf(marker);
  return index >= 0 ? decodeURIComponent(urlOrPath.slice(index + marker.length)) : urlOrPath;
};

const getFileType = (file) => {
  switch (file.type) {
    case 'image/jpeg': return '.jpg';
    case 'image/png': return '.png';
    case 'image/webp': return '.webp';
    case 'image/gif': return '.gif';
    default: return '.jpg';
  }
};

const getDocumentType = (file) => {
  switch (file.type) {
    case 'application/pdf': return '.pdf';
    case 'application/msword': return '.doc';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return '.docx';
    default: return '.bin';
  }
};

/**
 * Create a local preview URL for a selected image.
 * @param {File} file
 * @returns {Promise<string>}
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
