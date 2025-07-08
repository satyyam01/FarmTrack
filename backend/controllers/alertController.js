const Notification = require('../models/notification');
const Animal = require('../models/animal');
const ReturnLog = require('../models/returnLog');
const User = require('../models/user');
const { sendEmail } = require('../utils/emailService');
const { delCache } = require('../utils/cache');
const { 
  generateAlertEmail, 
  generateFencingAlertEmail, 
  generateBarnCheckAlertEmail 
} = require('../utils/emailTemplates');

// Helper to get today's date as YYYY-MM-DD string (timezone compliant)
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

exports.barnCheckAlert = async (req, res) => {
  try {
    const currentDate = getTodayString();
    const farm_id = req.user.farm_id;

    const animals = await Animal.find({ farm_id });
    let missingAnimals = [];

    for (const animal of animals) {
      const logExists = await ReturnLog.findOne({
        animal_id: animal._id,
        farm_id,
        date: currentDate
      });

      if (!logExists) {
        missingAnimals.push(`${animal.name} (${animal.tag_number})`);
      }
    }

    let alertsSent = [];

    if (missingAnimals.length > 0) {
      const message = `⚠️ The following animals have not returned to the barn as of today (${currentDate}):\n${missingAnimals.join(', ')}`;

      const notification = await Notification.create({ 
        user_id: req.user.id,
        title: 'Barn Check Alert',
        message, 
        farm_id 
      });

      // Invalidate dashboard overview cache for this farm
      await delCache(`page:dashboard:overview:${farm_id}`);

      alertsSent.push(notification);

      // Send email with improved template
      const user = await User.findById(req.user.id);
      if (user?.email) {
        const html = generateBarnCheckAlertEmail(missingAnimals, currentDate);
        const emailResult = await sendEmail({
          to: user.email,
          subject: '🚨 Barn Check Alert - FarmTrack',
          html
        });

        if (!emailResult.success) {
          console.error('❌ Failed to send barn check alert email:', emailResult.error);
        }
      }
    }

    res.status(200).json({
      message: missingAnimals.length > 0 
        ? `1 alert generated for ${missingAnimals.length} missing barn entries.`
        : 'All animals have returned to the barn.',
      alerts: alertsSent
    });

  } catch (error) {
    console.error('Barn check error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.fencingAlert = async (req, res) => {
  try {
    const { tag_number } = req.body;

    const animal = await Animal.findOne({ tag_number, farm_id: req.user.farm_id });
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found in your farm' });
    }

    const alertMessage = `🚨 Animal "${animal.name}" (${animal.tag_number}) is near the farm boundary.`;

    const notification = await Notification.create({
      user_id: req.user.id,
      title: 'Fencing Alert',
      message: alertMessage,
      farm_id: req.user.farm_id
    });

    // Invalidate dashboard overview cache for this farm
    await delCache(`page:dashboard:overview:${req.user.farm_id}`);

    // Send email with improved template
    const user = await User.findById(req.user.id);
    if (user?.email) {
      const html = generateFencingAlertEmail(animal.name, animal.tag_number);
      const emailResult = await sendEmail({
        to: user.email,
        subject: '🚨 Fencing Alert - FarmTrack',
        html
      });

      if (!emailResult.success) {
        console.error('❌ Failed to send fencing alert email:', emailResult.error);
      }
    }

    res.status(201).json({ message: 'Fencing alert created', notification });
  } catch (error) {
    console.error('Fencing alert error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
