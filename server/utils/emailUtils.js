// ============================================
// EMAIL UTILS - REAL SMTP SENDING
// ============================================

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'indian.tx.tl@gmail.com',
    pass: process.env.EMAIL_PASS || 'quwr bqtx hbbv ebxv',
  },
});

/**
 * Send OTP Email
 * @param {string} to - Recipient email
 * @param {string} otp - The OTP code
 * @returns {Promise}
 */
exports.sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Youth Assam" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Youth Assam Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">Youth Assam</h1>
        </div>
        <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937;">Verify Your Email</h2>
          <p style="color: #4b5563;">Use the following code to complete your registration:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #10b981; background: #f0fdf4; padding: 10px 20px; border-radius: 8px;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Youth Assam. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send Password Reset Email
 * @param {string} to - Recipient email
 * @param {string} resetLink - The reset link
 * @returns {Promise}
 */
exports.sendPasswordResetEmail = async (to, resetLink) => {
  const mailOptions = {
    from: `"Youth Assam" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">Youth Assam</h1>
        </div>
        <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937;">Password Reset Request</h2>
          <p style="color: #4b5563;">Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw new Error('Failed to send reset email');
  }
};
