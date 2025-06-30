// utils/emailTemplates.js
exports.generateAlertEmail = (title, message, alertType = 'general') => {
  // Replace template variables
  const template = `
<html>
<head>
  <meta charset="UTF-8">
  <title>FarmTrack Alert</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f7;
      padding: 40px;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.05);
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #2b9348;
      font-size: 22px;
      margin: 0;
    }
    .content {
      font-size: 16px;
      line-height: 1.6;
    }
    .alert-box {
      background-color: #fff3cd;
      border-left: 5px solid #ffc107;
      padding: 12px 20px;
      margin: 20px 0;
      border-radius: 4px;
      color: #856404;
    }
    .fencing-alert {
      background-color: #f8d7da;
      border-left: 5px solid #dc3545;
      color: #721c24;
    }
    .night-return-alert {
      background-color: #d1ecf1;
      border-left: 5px solid #17a2b8;
      color: #0c5460;
    }
    .footer {
      font-size: 12px;
      text-align: center;
      color: #888;
      margin-top: 30px;
    }
    .footer a {
      color: #888;
      text-decoration: none;
      margin: 0 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 FarmTrack Alert Notification</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>You have a new alert from FarmTrack:</p>
      <div class="alert-box ${alertType === 'fencing' ? 'fencing-alert' : alertType === 'night-return' ? 'night-return-alert' : ''}">
        <strong>${title}</strong><br>
        ${message}
      </div>
      <p>Please log into your dashboard for more details.</p>
      <p>Stay safe,<br>Team FarmTrack</p>
    </div>

    <div class="footer">
      <a href="#" target="_blank">Unsubscribe</a>
      |
      <a href="#" target="_blank">Manage Preferences</a>
    </div>
  </div>
</body>
</html>
  `;
  
  return template;
};

// Specific templates for different alert types
exports.generateFencingAlertEmail = (animalName, tagNumber) => {
  const title = 'Fencing Alert';
  const message = `🚨 Animal "${animalName}" (${tagNumber}) is near the farm boundary. Please check immediately.`;
  return this.generateAlertEmail(title, message, 'fencing');
};

exports.generateNightReturnAlertEmail = (missingAnimals, date) => {
  const title = 'Night Return Alert';
  const message = `🌙 The following animals did not return to the barn tonight (${date}):\n${missingAnimals.join(', ')}`;
  return this.generateAlertEmail(title, message, 'night-return');
};

exports.generateBarnCheckAlertEmail = (missingAnimals, date) => {
  const title = 'Barn Check Alert';
  const message = `⚠️ The following animals have not returned to the barn as of today (${date}):\n${missingAnimals.join(', ')}`;
  return this.generateAlertEmail(title, message, 'barn-check');
};
