// ============================================
// OTP CONTROLLER
// ============================================

const { generateOTP, storeOTP, verifyOTP } = require('../utils/otpUtils');
const { sendOTPEmail } = require('../utils/emailUtils');

/**
 * Send OTP to email
 */
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    const otp = generateOTP();
    storeOTP(email, otp);
    
    await sendOTPEmail(email, otp);
    
    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully' 
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP' 
    });
  }
};

/**
 * Verify OTP
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    
    const isValid = verifyOTP(email, otp);
    
    if (isValid) {
      res.status(200).json({ 
        success: true, 
        message: 'OTP verified successfully' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP' 
    });
  }
};

/**
 * Resend OTP
 */
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    const otp = generateOTP();
    storeOTP(email, otp);
    
    await sendOTPEmail(email, otp);
    
    res.status(200).json({ 
      success: true, 
      message: 'New OTP sent successfully' 
    });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to resend OTP' 
    });
  }
};
