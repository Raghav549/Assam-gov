// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format date to readable string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (current, total) => {
  if (!total || total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
};

/**
 * Format currency (INR)
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate UPI ID format
 */
export const isValidUPI = (upi) => {
  const re = /^[a-zA-Z0-9._+-]+@[a-zA-Z]{2,}$/;
  return re.test(upi);
};

/**
 * Validate phone number (Indian)
 */
export const isValidPhone = (phone) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone.replace(/\s/g, ''));
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Get status badge class
 */
export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'badge-pending';
    case 'in-progress':
    case 'running': return 'badge-progress';
    case 'resolved':
    case 'completed':
    case 'approved': return 'badge-resolved';
    case 'delayed':
    case 'rejected': return 'badge-delayed';
    case 'active': return 'badge-active';
    default: return 'badge-pending';
  }
};

/**
 * Sort items by date
 */
export const sortByDate = (items, field = 'createdAt', order = 'desc') => {
  return [...items].sort((a, b) => {
    const dateA = a[field]?.toDate ? a[field].toDate() : new Date(a[field]);
    const dateB = b[field]?.toDate ? b[field].toDate() : new Date(b[field]);
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

/**
 * Group items by key
 */
export const groupBy = (items, key) => {
  return items.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

export default {
  formatDate,
  formatDateTime,
  getRelativeTime,
  truncateText,
  generateId,
  calculateProgress,
  formatCurrency,
  debounce,
  copyToClipboard,
  isValidEmail,
  isValidUPI,
  isValidPhone,
  getInitials,
  getStatusBadgeClass,
  sortByDate,
  groupBy
};
