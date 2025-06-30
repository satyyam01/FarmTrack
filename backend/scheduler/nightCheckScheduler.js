const cron = require('node-cron');
const checkAnimalReturnStatus = require('../utils/nightCheckLogic');
const Setting = require('../models/setting');

let cronJobs = new Map(); // Map to store cron jobs per farm

// Convert HH:MM time to cron format
const timeToCron = (time) => {
  const [hour, minute] = time.split(':').map(Number);
  return `${minute} ${hour} * * *`;
};

// ⏰ Schedule to run daily at the configured time for all farms
const scheduleNightCheck = async () => {
  try {
    // Get all night check schedules from database
    const settings = await Setting.find({ key: 'night_check_schedule' });
    
    // Clear existing cron jobs
    cronJobs.forEach(job => job.stop());
    cronJobs.clear();
    
    // Create cron jobs for each farm
    for (const setting of settings) {
      const farmId = setting.farm_id.toString();
      const scheduleTime = setting.value || '21:00'; // Default to 9 PM
      
      // Create new cron job for this farm
      const cronJob = cron.schedule(timeToCron(scheduleTime), async () => {
        await checkAnimalReturnStatus(farmId);
      });
      
      cronJobs.set(farmId, cronJob);
    }
    
    // If no farms have settings, create a default job
    if (settings.length === 0) {
      const defaultJob = cron.schedule('0 21 * * *', async () => {
        await checkAnimalReturnStatus();
      });
      cronJobs.set('default', defaultJob);
    }
    
  } catch (error) {
    // Fallback to default 9 PM schedule
    const fallbackJob = cron.schedule('0 21 * * *', async () => {
    });
    cronJobs.set('fallback', fallbackJob);
  }
};

// Update schedule dynamically for a specific farm
const updateSchedule = async (newTime, farmId) => {
  try {
    // Cancel existing job for this farm
    if (cronJobs.has(farmId.toString())) {
      cronJobs.get(farmId.toString()).stop();
      cronJobs.delete(farmId.toString());
    }
    
    // Create new cron job with updated time for this farm
    const cronJob = cron.schedule(timeToCron(newTime), async () => {
      await checkAnimalReturnStatus(farmId);
    });
    
    cronJobs.set(farmId.toString(), cronJob);
  } catch (error) {
  }
};

// 🧪 Manual test function for immediate execution
const testNightCheck = async (farmId = null) => {
  try {
    await checkAnimalReturnStatus(farmId);
  } catch (error) {
  }
};

module.exports = { 
  scheduleNightCheck, 
  testNightCheck, 
  updateSchedule 
};
