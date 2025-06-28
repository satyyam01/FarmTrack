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
    console.log('🕐 Setting up night check schedules for all farms...');
    
    // Get all night check schedules from database
    const settings = await Setting.find({ key: 'night_check_schedule' });
    
    // Clear existing cron jobs
    cronJobs.forEach(job => job.stop());
    cronJobs.clear();
    
    // Create cron jobs for each farm
    for (const setting of settings) {
      const farmId = setting.farm_id.toString();
      const scheduleTime = setting.value || '21:00'; // Default to 9 PM
      
      console.log(`🕐 Setting up cron job for farm ${farmId} to run daily at ${scheduleTime}...`);
      
      // Create new cron job for this farm
      const cronJob = cron.schedule(timeToCron(scheduleTime), async () => {
        console.log(`🔔 Running scheduled night return check for farm ${farmId}...`);
        await checkAnimalReturnStatus(farmId);
      });
      
      cronJobs.set(farmId, cronJob);
      console.log(`✅ Night check scheduled for farm ${farmId} at ${scheduleTime} daily`);
    }
    
    // If no farms have settings, create a default job
    if (settings.length === 0) {
      console.log('🕐 No farm schedules found, setting up default 9 PM schedule...');
      const defaultJob = cron.schedule('0 21 * * *', async () => {
        console.log('🔔 Running default scheduled night return check...');
        await checkAnimalReturnStatus();
      });
      cronJobs.set('default', defaultJob);
    }
    
  } catch (error) {
    console.error('❌ Error setting up night check schedules:', error);
    // Fallback to default 9 PM schedule
    console.log('🕐 Falling back to default 9 PM schedule...');
    const fallbackJob = cron.schedule('0 21 * * *', async () => {
      console.log('🔔 Running fallback scheduled night return check...');
    await checkAnimalReturnStatus();
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
    
    console.log(`🕐 Updating cron job for farm ${farmId} to run daily at ${newTime}...`);
    
    // Create new cron job with updated time for this farm
    const cronJob = cron.schedule(timeToCron(newTime), async () => {
      console.log(`🔔 Running scheduled night return check for farm ${farmId}...`);
      await checkAnimalReturnStatus(farmId);
    });
    
    cronJobs.set(farmId.toString(), cronJob);
    console.log(`✅ Night check schedule updated for farm ${farmId} to ${newTime}`);
  } catch (error) {
    console.error('❌ Error updating night check schedule:', error);
  }
};

// 🧪 Manual test function for immediate execution
const testNightCheck = async (farmId = null) => {
  console.log(`🧪 Testing night return check manually${farmId ? ` for farm ${farmId}` : ''}...`);
  try {
    await checkAnimalReturnStatus(farmId);
    console.log('✅ Manual test completed successfully');
  } catch (error) {
    console.error('❌ Manual test failed:', error.message);
  }
};

module.exports = { 
  scheduleNightCheck, 
  testNightCheck, 
  updateSchedule 
};
