const Notification = require('../models/notification');
const Animal = require('../models/animal');
const ReturnLog = require('../models/returnLog');

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
    // Use timezone-compliant date string (like yield logic)
    const currentDate = getTodayString();
    const farm_id = req.user.farm_id;

    // Fetch all animals in this farm
    const animals = await Animal.find({ farm_id });

    let missingAnimals = [];

    for (const animal of animals) {
      // Check for return logs using string date comparison (timezone compliant)
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
      alertsSent.push(notification);
    }

    res.status(200).json({
      message: missingAnimals.length > 0 
        ? `1 alert generated for ${missingAnimals.length} missing barn entries.`
        : 'All animals have returned to the barn.',
      alerts: alertsSent
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.fencingAlert = async (req, res) => {
  try {
    const { tag_number } = req.body;

    // Find animal by tag and farm_id
    const animal = await Animal.findOne({ tag_number, farm_id: req.user.farm_id });
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found in your farm' });
    }

    // Create notification
    const notification = await Notification.create({
      user_id: req.user.id,
      title: 'Fencing Alert',
      message: `🚨 Animal "${animal.name}" (${animal.tag_number}) is near the farm boundary.`,
      farm_id: req.user.farm_id
    });

    res.status(201).json({ message: 'Fencing alert created', notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
