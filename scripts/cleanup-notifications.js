require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('../models/notification');

async function cleanupNotifications() {
  try {
    console.log('🧹 Cleaning up notifications without farm_id...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Find notifications without farm_id
    const notificationsWithoutFarmId = await Notification.find({ 
      farm_id: { $exists: false }
    });

    console.log(`📊 Found ${notificationsWithoutFarmId.length} notifications without farm_id`);

    if (notificationsWithoutFarmId.length > 0) {
      console.log('\n🗑️  Deleting notifications without farm_id:');
      
      for (const notification of notificationsWithoutFarmId) {
        console.log(`   - Deleting: ${notification.title} (${notification._id})`);
        await Notification.deleteOne({ _id: notification._id });
      }
      
      console.log(`✅ Successfully deleted ${notificationsWithoutFarmId.length} notifications`);
    } else {
      console.log('✅ No notifications to clean up');
    }

    // Verify cleanup
    const remainingNotificationsWithoutFarmId = await Notification.find({ 
      farm_id: { $exists: false }
    });

    if (remainingNotificationsWithoutFarmId.length === 0) {
      console.log('✅ All notifications now have farm_id field');
    } else {
      console.log(`⚠️  Still found ${remainingNotificationsWithoutFarmId.length} notifications without farm_id`);
    }
    
  } catch (error) {
    console.error('❌ Error cleaning up notifications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

cleanupNotifications(); 