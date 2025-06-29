const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true, // Use true for port 465
  auth: {
    user: 'farmtrack@satyyam.site',
    pass: 'Farmtrackpass@2608;' // or app password if 2FA is enabled
  }
});

const mailOptions = {
  from: '"FarmTrack Alerts" <farmtrack@satyyam.site>',
  to: 'shriyamstiwari@gmail.com',
  subject: 'Hi Babu, love you',
  text: 'Hello! This is a test email sent from NodeMailer using Zoho SMTP.',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error('❌ Error:', error);
  }
  console.log('✅ Email sent:', info.response);
});
