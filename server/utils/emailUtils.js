// ============================================
// EMAIL UTILS - STABLE GMAIL SMTP VERSION
// ============================================

const nodemailer = require('nodemailer');

// ============================================
// SMTP TRANSPORTER
// ============================================

const transporter = nodemailer.createTransport({

  service: 'gmail',

  auth: {

    user: process.env.EMAIL_USER,

    pass: process.env.EMAIL_PASS,

  },

  connectionTimeout: 30000,

  greetingTimeout: 30000,

  socketTimeout: 30000,

  tls: {

    rejectUnauthorized: false,

  },

});

// ============================================
// VERIFY SMTP CONNECTION
// ============================================

transporter.verify((error, success) => {

  if (error) {

    console.error('SMTP ERROR:', error);

  } else {

    console.log('SMTP SERVER READY');

  }

});

// ============================================
// SEND OTP EMAIL
// ============================================

exports.sendOTPEmail = async (to, otp) => {

  try {

    const mailOptions = {

      from: `"Youth Assam" <${process.env.EMAIL_USER}>`,

      to,

      subject: 'Your Youth Assam Verification Code',

      html: `

        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">

          <div style="
            background:linear-gradient(135deg,#0f172a,#06b6d4,#8b5cf6);
            padding:30px;
            text-align:center;
            color:white;
            border-radius:20px 20px 0 0;
          ">

            <h1 style="margin:0;font-size:32px;">
              Youth Assam
            </h1>

            <p style="margin-top:10px;opacity:0.9;">
              Email Verification
            </p>

          </div>

          <div style="
            background:#ffffff;
            padding:40px;
            border:1px solid #e5e7eb;
            border-radius:0 0 20px 20px;
          ">

            <h2 style="color:#111827;">
              Verify Your Email
            </h2>

            <p style="
              color:#4b5563;
              font-size:16px;
              line-height:1.7;
            ">
              Use the OTP below to continue your registration.
            </p>

            <div style="
              text-align:center;
              margin:35px 0;
            ">

              <div style="
                display:inline-block;
                background:linear-gradient(135deg,#06b6d4,#8b5cf6);
                color:white;
                font-size:40px;
                font-weight:bold;
                letter-spacing:8px;
                padding:18px 35px;
                border-radius:18px;
                box-shadow:0 15px 40px rgba(0,0,0,0.15);
              ">

                ${otp}

              </div>

            </div>

            <p style="
              color:#6b7280;
              font-size:14px;
              line-height:1.7;
            ">
              This OTP will expire in 10 minutes.
            </p>

            <p style="
              color:#6b7280;
              font-size:14px;
              line-height:1.7;
            ">
              If you didn't request this verification,
              you can safely ignore this email.
            </p>

            <hr style="
              margin:30px 0;
              border:none;
              border-top:1px solid #e5e7eb;
            ">

            <p style="
              text-align:center;
              color:#9ca3af;
              font-size:12px;
            ">

              © ${new Date().getFullYear()} Youth Assam

            </p>

          </div>

        </div>

      `,

    };

    const info = await transporter.sendMail(mailOptions);

    console.log('OTP EMAIL SENT:', info.messageId);

    return {

      success: true,

      messageId: info.messageId,

    };

  } catch (error) {

    console.error('OTP EMAIL ERROR:', error);

    throw error;

  }

};

// ============================================
// SEND PASSWORD RESET EMAIL
// ============================================

exports.sendPasswordResetEmail = async (to, resetLink) => {

  try {

    const mailOptions = {

      from: `"Youth Assam" <${process.env.EMAIL_USER}>`,

      to,

      subject: 'Reset Your Password',

      html: `

        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">

          <div style="
            background:linear-gradient(135deg,#0f172a,#06b6d4,#8b5cf6);
            padding:30px;
            text-align:center;
            color:white;
            border-radius:20px 20px 0 0;
          ">

            <h1 style="margin:0;">
              Youth Assam
            </h1>

          </div>

          <div style="
            background:#ffffff;
            padding:40px;
            border:1px solid #e5e7eb;
            border-radius:0 0 20px 20px;
          ">

            <h2 style="color:#111827;">
              Reset Password
            </h2>

            <p style="
              color:#4b5563;
              line-height:1.7;
            ">
              Click below to reset your password.
            </p>

            <div style="
              text-align:center;
              margin:35px 0;
            ">

              <a
                href="${resetLink}"
                style="
                  display:inline-block;
                  background:linear-gradient(135deg,#06b6d4,#8b5cf6);
                  color:white;
                  text-decoration:none;
                  padding:14px 30px;
                  border-radius:14px;
                  font-weight:bold;
                "
              >

                Reset Password

              </a>

            </div>

          </div>

        </div>

      `,

    };

    const info = await transporter.sendMail(mailOptions);

    console.log('RESET EMAIL SENT:', info.messageId);

    return {

      success: true,

      messageId: info.messageId,

    };

  } catch (error) {

    console.error('RESET EMAIL ERROR:', error);

    throw error;

  }

};
