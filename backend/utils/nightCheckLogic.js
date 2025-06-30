const Animal = require('../models/animal');
const ReturnLog = require('../models/returnLog');
const Notification = require('../models/notification');
const Farm = require('../models/farm');
const User = require('../models/user');
const { sendEmail } = require('./emailService');
const { generateNightReturnAlertEmail } = require('./emailTemplates');

// Helper to get today's date as YYYY-MM-DD string (timezone compliant)
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const checkAnimalReturnStatus = async (farmId = null) => {
  try {
    const todayString = getTodayString();
    let farmsToCheck = [];

    if (farmId) {
      const farm = await Farm.findById(farmId);
      if (farm) farmsToCheck.push(farm);
    } else {
      const farmIds = await Animal.distinct('farm_id');
      for (const id of farmIds) {
        const farm = await Farm.findById(id);
        if (farm) farmsToCheck.push(farm);
      }
    }

    for (const farm of farmsToCheck) {
      const animals = await Animal.find({ farm_id: farm._id });
      let missingAnimals = [];

      for (const animal of animals) {
        const returnLog = await ReturnLog.findOne({
          animal_id: animal._id,
          date: todayString
        });

        if (!returnLog || returnLog.returned === false) {
          missingAnimals.push(`${animal.name} (${animal.tag_number})`);
        }
      }

      if (missingAnimals.length > 0) {
        const message = `🌙 The following animals did not return to the barn tonight (${todayString}):\n${missingAnimals.join(', ')}`;

        // Store in DB
        await Notification.create({
          user_id: farm.owner,
          title: 'Night Return Alert',
          message,
          farm_id: farm._id
        });

        // Send email to farm owner with improved template
        const user = await User.findById(farm.owner);
        if (user?.email) {
          const html = generateNightReturnAlertEmail(missingAnimals, todayString);
          const emailResult = await sendEmail({
            to: user.email,
            subject: '🌙 Night Return Alert - FarmTrack',
            html
          });

          if (!emailResult.success) {
            console.error(`❌ Failed to send night return alert email to ${user.email}:`, emailResult.error);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error during night return check:', error.message);
  }
};

module.exports = checkAnimalReturnStatus;