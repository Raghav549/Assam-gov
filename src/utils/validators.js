// ============================================
// VALIDATORS
// ============================================

export const validateSignup = (data) => {
  const errors = {};
  
  if (!data.displayName?.trim()) {
    errors.displayName = 'Full name is required';
  } else if (data.displayName.trim().length < 2) {
    errors.displayName = 'Name must be at least 2 characters';
  }
  
  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.password = 'Password must contain uppercase, lowercase, and a number';
  }
  
  if (data.password && data.confirmPassword !== data.password) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return errors;
};

export const validateLogin = (data) => {
  const errors = {};
  
  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  return errors;
};

export const validateHelpRequest = (data) => {
  const errors = {};
  
  if (!data.name?.trim()) errors.name = 'Name is required';
  if (!data.issueType) errors.issueType = 'Issue type is required';
  if (!data.description?.trim()) errors.description = 'Description is required';
  else if (data.description.trim().length < 20) errors.description = 'Description must be at least 20 characters';
  if (!data.location?.trim()) errors.location = 'Location is required';
  if (!data.contact?.trim()) errors.contact = 'Contact number is required';
  else if (!/^[6-9]\d{9}$/.test(data.contact.replace(/\s/g, ''))) errors.contact = 'Enter a valid Indian phone number';
  
  return errors;
};

export const validateDonationRequest = (data) => {
  const errors = {};
  
  if (!data.title?.trim()) errors.title = 'Title is required';
  if (!data.description?.trim()) errors.description = 'Description is required';
  if (!data.targetAmount || data.targetAmount <= 0) errors.targetAmount = 'Valid target amount is required';
  if (!data.upiId?.trim()) errors.upiId = 'UPI ID is required';
  else if (!/^[a-zA-Z0-9._+-]+@[a-zA-Z]{2,}$/.test(data.upiId)) errors.upiId = 'Enter a valid UPI ID';
  if (!data.proofUrl) errors.proofUrl = 'Proof document/image is required';
  
  return errors;
};

export const validatePost = (data) => {
  const errors = {};
  
  if (!data.content?.trim()) errors.content = 'Post content is required';
  else if (data.content.trim().length < 10) errors.content = 'Post must be at least 10 characters';
  if (!data.category) errors.category = 'Category is required';
  
  return errors;
};

export const validateScholarship = (data) => {
  const errors = {};
  
  if (!data.title?.trim()) errors.title = 'Title is required';
  if (!data.description?.trim()) errors.description = 'Description is required';
  if (!data.applyLink?.trim()) errors.applyLink = 'Apply link is required';
  else if (!/^https?:\/\/.+/.test(data.applyLink)) errors.applyLink = 'Enter a valid URL';
  if (!data.deadline) errors.deadline = 'Deadline is required';
  if (!data.eligibility?.trim()) errors.eligibility = 'Eligibility details are required';
  
  return errors;
};

export const validateCourse = (data) => {
  const errors = {};
  
  if (!data.title?.trim()) errors.title = 'Title is required';
  if (!data.platform?.trim()) errors.platform = 'Platform name is required';
  if (!data.enrollLink?.trim()) errors.enrollLink = 'Enrollment link is required';
  else if (!/^https?:\/\/.+/.test(data.enrollLink)) errors.enrollLink = 'Enter a valid URL';
  if (!data.description?.trim()) errors.description = 'Description is required';
  
  return errors;
};

export const validateGovtWork = (data) => {
  const errors = {};
  
  if (!data.title?.trim()) errors.title = 'Title is required';
  if (!data.description?.trim()) errors.description = 'Description is required';
  if (!data.location?.trim()) errors.location = 'Location is required';
  if (!data.status) errors.status = 'Status is required';
  if (data.budgetAllocated && isNaN(data.budgetAllocated)) errors.budgetAllocated = 'Budget must be a number';
  if (data.fundUsed && isNaN(data.fundUsed)) errors.fundUsed = 'Fund used must be a number';
  
  return errors;
};

export const validateProfile = (data) => {
  const errors = {};
  
  if (data.displayName && data.displayName.trim().length < 2) {
    errors.displayName = 'Name must be at least 2 characters';
  }
  
  if (data.phone && !/^[6-9]\d{9}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.phone = 'Enter a valid Indian phone number';
  }
  
  if (data.bio && data.bio.length > 500) {
    errors.bio = 'Bio must be less than 500 characters';
  }
  
  return errors;
};

export default {
  validateSignup,
  validateLogin,
  validateHelpRequest,
  validateDonationRequest,
  validatePost,
  validateScholarship,
  validateCourse,
  validateGovtWork,
  validateProfile
};
