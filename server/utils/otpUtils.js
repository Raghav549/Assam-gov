// ============================================
// OTP UTILS - GENERATION AND STORAGE
// ============================================

// In-memory store for OTPs (In production, use Redis)
const otpStore = new Map();

/**
 * Generate a 6-digit random OTP
 * @returns {string}
 */
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP with expiration
 * @param {string} email
 * @param {string} otp
 */
exports.storeOTP = (email, otp) => {
  const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email, { otp, expiryTime });
  
  // Clean up expired OTPs periodically
  if (otpStore.size % 100 === 0) {
    cleanupExpiredOTPs();
  }
};

/**
 * Verify OTP
 * @param {string} email
 * @param {string} providedOTP
 * @returns {boolean}
 */
exports.verifyOTP = (email, providedOTP) => {
  const storedData = otpStore.get(email);
  
  if (!storedData) {
    return false;
  }
  
  const { otp, expiryTime } = storedData;
  
  if (Date.now() > expiryTime) {
    otpStore.delete(email); // Remove expired OTP
    return false;
  }
  
  if (otp === providedOTP) {
    otpStore.delete(email); // Remove used OTP
    return true;
  }
  
  return false;
};

/**
 * Clean up expired OTPs
 */
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  for (let [email, data] of otpStore.entries()) {
    if (now > data.expiryTime) {
      otpStore.delete(email);
    }
  }
};
