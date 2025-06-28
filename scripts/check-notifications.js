// scripts/check-notifications.js
require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('../models/notification');

async function checkNotifications() {
  try {
    console.log('🔍 Checking for notifications...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Check for notifications without farm_id (potential migration issue)
    const notificationsWithoutFarmId = await Notification.find({ 
      farm_id: { $exists: false }
    });

    if (notificationsWithoutFarmId.length > 0) {
      console.log(`⚠️  Found ${notificationsWithoutFarmId.length} notifications without farm_id:`);
      console.log('   These notifications may cause issues with the updated schema.');
      console.log('   Consider migrating or deleting these notifications.');
      
      notificationsWithoutFarmId.slice(0, 3).forEach((notification, index) => {
        console.log(`\n   ${index + 1}. Notification ID: ${notification._id}`);
        console.log(`      Title: ${notification.title}`);
        console.log(`      User ID: ${notification.user_id}`);
        console.log(`      Created: ${notification.createdAt}`);
      });
      
      if (notificationsWithoutFarmId.length > 3) {
        console.log(`   ... and ${notificationsWithoutFarmId.length - 3} more`);
      }
    } else {
      console.log('✅ All notifications have farm_id field');
    }

    // Find recent night check notifications
    const notifications = await Notification.find({ 
      title: 'Night Return Alert',
      farm_id: { $exists: true }
    }).sort({ createdAt: -1 }).limit(5);

    console.log(`\n📊 Found ${notifications.length} night check notifications:`);
    
    notifications.forEach((notification, index) => {
      console.log(`\n${index + 1}. Notification ID: ${notification._id}`);
      console.log(`   Title: ${notification.title}`);
      console.log(`   Message: ${notification.message}`);
      console.log(`   Created: ${notification.createdAt}`);
      console.log(`   User ID: ${notification.user_id}`);
      console.log(`   Farm ID: ${notification.farm_id}`);
      console.log(`   Read: ${notification.isRead}`);
    });

    if (notifications.length === 0) {
      console.log('❌ No night check notifications found.');
      console.log('💡 This could mean:');
      console.log('   - All animals have returned to the barn');
      console.log('   - No animals exist in the database');
      console.log('   - Cron job hasn\'t run yet');
      console.log('   - Notifications without farm_id were filtered out');
    }
    
  } catch (error) {
    console.error('❌ Error checking notifications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the check
checkNotifications(); 