const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const otpStore = new Map(); // In-memory. Use Redis for production.

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(email) {
  const otp = generateOTP();

  // Store OTP with expiry (10 mins)
  otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

  const msg = {
    to: email,
    from: `Farmtrack Verify <${process.env.SENDER_EMAIL || process.env.EMAIL_USER}>`,
    subject: '🔐 Your FarmTrack Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
          <h2 style="color: #2b9348; margin-bottom: 20px;">FarmTrack Verification</h2>
          <p style="color: #6c757d; margin-bottom: 20px;">Your verification code is:</p>
          <div style="background-color: #e0f2e9; display: inline-block; padding: 15px 30px; border-radius: 8px; border: 2px solid #2b9348;">
            <h1 style="color: #2b9348; margin: 0; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #6c757d; margin-top: 20px; font-size: 14px;">This code expires in 10 minutes. Do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
          <p style="color: #6c757d; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      </div>
    `
  };

  await sgMail.send(msg);
  return true;
}

function verifyOTP(email, inputOtp) {
  const data = otpStore.get(email);
  if (!data) return false;
  if (Date.now() > data.expiresAt) {
    otpStore.delete(email);
    return false;
  }

  const isValid = data.otp === inputOtp;
  if (isValid) otpStore.delete(email);
  return isValid;
}

module.exports = { sendOTP, verifyOTP }; 