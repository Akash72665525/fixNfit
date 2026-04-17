const nodemailer = require('nodemailer');

// Create transporter (configure with your email service)
const createTransporter = () => {
  // Using Gmail SMTP - you can also use other providers
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });
};

// Shared from address (use same EMAIL_USER for all outgoing messages)
const FROM_EMAIL = process.env.EMAIL_USER || 'noreply@fixnfit.com';

// Send OTP email
const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: FROM_EMAIL,
      to: email,
      subject: 'FixNFit - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%); padding: 20px; border-radius: 8px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">FixNFit</h1>
          </div>
          
          <div style="padding: 30px; background: #f5f5f5; border-radius: 8px; margin-top: 20px;">
            <h2 style="color: #333; text-align: center;">Email Verification</h2>
            
            <p style="color: #666; text-align: center; font-size: 16px;">
              Your OTP for email verification is:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="font-size: 32px; font-weight: bold; color: #ff6b35; margin: 0; letter-spacing: 5px;">
                ${otp}
              </p>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              This OTP is valid for 10 minutes. Do not share it with anyone.
            </p>
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              If you didn't request this OTP, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>&copy; 2026 FixNFit. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email}:`, info.response);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email to ${email}:`, error.message);
    // Return false but don't crash - in development we can still use console OTP
    return false;
  }
};

// Send OTP SMS - uses Textbelt for a test number, otherwise logs to console
const https = require('https');
const querystring = require('querystring');

const sendOtpSms = async (phone, otp) => {
  try {
    // If the phone is the test number, attempt to send via Textbelt
    const TEST_NUMBER = '9324134044';
    const message = `Your FixNFit verification code is ${otp}. It is valid for 10 minutes.`;

    if (phone === TEST_NUMBER) {
      // Textbelt expects international format for many countries; for dev we'll send the raw number
      const postData = querystring.stringify({
        phone: phone,
        message: message,
        key: process.env.TEXTBELT_KEY || 'textbelt'
      });

      const options = {
        hostname: 'textbelt.com',
        path: '/text',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const result = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              resolve(parsed);
            } catch (e) {
              resolve({ success: false, error: 'Invalid JSON from SMS provider' });
            }
          });
        });

        req.on('error', (err) => reject(err));
        req.write(postData);
        req.end();
      });

      console.log(`📱 Textbelt response for ${phone}:`, result);
      // If Textbelt accepted the message return true, otherwise signal failure
      if (result && result.success) return true;
      console.warn('⚠️ Textbelt failed — falling back to console log');
      // Provider was attempted but failed; we'll still log the OTP for dev debugging
      console.log(`\n📱 SMS OTP (fallback) for ${phone}: ${otp}`);
      console.log(`(Valid for 10 minutes)\n`);
      return false;
    }
    // Fallback for non-test numbers: log SMS to console (or hook into another SMS provider)
    console.log(`\n📱 SMS OTP for ${phone}: ${otp}`);
    console.log(`(Valid for 10 minutes)\n`);
    return true;
  } catch (error) {
    console.error(`Error sending SMS to ${phone}:`, error && error.message ? error.message : error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    
    // Create reset link (frontend will handle the reset page)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: FROM_EMAIL,
      to: email,
      subject: 'FixNFit - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%); padding: 20px; border-radius: 8px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">FixNFit</h1>
          </div>
          
          <div style="padding: 30px; background: #f5f5f5; border-radius: 8px; margin-top: 20px;">
            <h2 style="color: #333; text-align: center;">Password Reset</h2>
            
            <p style="color: #666; text-align: center; font-size: 16px;">
              We received a request to reset your password. Click the button below to set a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="
                display: inline-block;
                background: #ff6b35;
                color: white;
                padding: 12px 40px;
                border-radius: 4px;
                text-decoration: none;
                font-weight: bold;
                font-size: 16px;
              ">
                Reset Password
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              Or copy and paste this link in your browser:
            </p>
            
            <p style="color: #ff6b35; font-size: 12px; text-align: center; word-break: break-all;">
              ${resetLink}
            </p>
            
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">
              This link is valid for 1 hour.
            </p>
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              If you didn't request a password reset, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>&copy; 2026 FixNFit. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}:`, info.response);
    return true;
  } catch (error) {
    console.error(`❌ Error sending password reset email to ${email}:`, error.message);
    return false;
  }
};

module.exports = {
  sendOtpEmail,
  sendOtpSms,
  sendPasswordResetEmail
};
