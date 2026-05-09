// ============================================
// OTP UTILS - GENERATION AND STORAGE
// ============================================

// In-memory OTP Store
const otpStore = new Map();

/**
 * Generate 6 Digit OTP
 */
exports.generateOTP = () => {

  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();

};

/**
 * Store OTP
 */
exports.storeOTP = (email, otp) => {

  const expiryTime =
    Date.now() + 10 * 60 * 1000;

  otpStore.set(email, {

    otp,

    expiryTime,

    attempts: 0,

  });

};

/**
 * Verify OTP
 */
exports.verifyOTP = (
  email,
  providedOTP
) => {

  const storedData =
    otpStore.get(email);

  if (!storedData) {

    return {
      success: false,
      message: 'OTP not found',
    };

  }

  const {
    otp,
    expiryTime,
    attempts,
  } = storedData;

  // EXPIRED
  if (Date.now() > expiryTime) {

    otpStore.delete(email);

    return {
      success: false,
      message: 'OTP expired',
    };

  }

  // TOO MANY ATTEMPTS
  if (attempts >= 5) {

    otpStore.delete(email);

    return {
      success: false,
      message: 'Too many attempts',
    };

  }

  // CORRECT OTP
  if (otp === providedOTP) {

    otpStore.delete(email);

    return {
      success: true,
      message: 'OTP verified',
    };

  }

  // WRONG OTP
  storedData.attempts += 1;

  otpStore.set(email, storedData);

  return {
    success: false,
    message: 'Invalid OTP',
  };

};

/**
 * Cleanup Expired OTPs
 */
const cleanupExpiredOTPs = () => {

  const now = Date.now();

  for (const [email, data] of otpStore.entries()) {

    if (now > data.expiryTime) {

      otpStore.delete(email);

    }

  }

};

// AUTO CLEANUP EVERY 5 MINUTES
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);
