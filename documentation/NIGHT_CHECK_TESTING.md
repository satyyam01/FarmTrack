# Night Check Testing Guide

## 🧪 Testing Methods

### 1. **Command Line Test (Recommended)**
```bash
# Run the test script directly
node scripts/test-night-check.js
```

### 2. **API Endpoint Test**
```bash
# Test via API (requires admin authentication)
curl -X POST http://localhost:3000/api/notifications/test-night-check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. **Manual Night Check Trigger**
```bash
# Trigger the regular night check (requires admin authentication)
curl -X POST http://localhost:3000/api/notifications/night-check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. **Barn Check Alert Test**
```bash
# Test barn check alert (requires authentication)
curl -X GET http://localhost:3000/api/alerts/barn-check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🕐 Cron Schedule Testing

### **Current Schedule**: Every day at 9:00 PM
- **Cron Pattern**: `0 21 * * *`
- **Server Time**: Uses server's local timezone

### **Test Different Times**:
```javascript
// In scheduler/nightCheckScheduler.js, change the cron pattern:

// Run every minute (for testing)
cron.schedule('* * * * *', async () => {
  console.log('🔔 Running scheduled night return check...');
  await checkAnimalReturnStatus();
});

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('🔔 Running scheduled night return check...');
  await checkAnimalReturnStatus();
});

// Run at specific time (e.g., 2:30 PM)
cron.schedule('30 14 * * *', async () => {
  console.log('🔔 Running scheduled night return check...');
  await checkAnimalReturnStatus();
});
```

## 📊 What to Check After Testing

### 1. **Console Output**
Look for these messages:
```
🧪 Testing night return check manually...
✅ Connected to MongoDB
🌙 The following animals did not return to the barn tonight (2025-06-28):
Bessi (A100), Chandi Prasad (A101), Radha (A102)
✅ Night return check completed.
✅ Manual test completed successfully
```

### 2. **Database Check**
```javascript
// Check if notifications were created
db.notifications.find({ title: "Night Return Alert" }).sort({ createdAt: -1 })

// Check return logs
db.returnlogs.find({}).sort({ createdAt: -1 })
```

### 3. **API Response Check**
```bash
# Check notifications via API
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🐛 Troubleshooting

### **Common Issues**:

1. **No notifications created**:
   - Check if animals exist in the database
   - Verify farm ownership
   - Check if return logs exist for today

2. **Timezone issues**:
   - Verify `getTodayString()` returns correct local date
   - Check server timezone settings

3. **Database connection issues**:
   - Verify MongoDB connection string
   - Check if database is accessible

### **Debug Mode**:
Add more logging to `utils/nightCheckLogic.js`:
```javascript
console.log('Today string:', todayString);
console.log('Farms found:', farms.length);
console.log('Animals in farm:', animals.length);
console.log('Missing animals:', missingAnimals);
```

## 🎯 Test Scenarios

### **Scenario 1: Animals Not Returned**
1. Ensure some animals don't have return logs for today
2. Run the test
3. Verify notifications are created

### **Scenario 2: All Animals Returned**
1. Create return logs for all animals for today
2. Run the test
3. Verify no notifications are created

### **Scenario 3: Mixed Status**
1. Create return logs for some animals only
2. Run the test
3. Verify notifications only for missing animals

## 📝 Expected Results

### **Successful Test Output**:
```json
{
  "message": "Night check test completed successfully."
}
```

### **Sample Notification Created**:
```json
{
  "user_id": "farm_owner_id",
  "title": "Night Return Alert",
  "message": "🌙 The following animals did not return to the barn tonight (2025-06-28):\nBessi (A100), Chandi Prasad (A101)",
  "farm_id": "farm_id",
  "isRead": false,
  "createdAt": "2025-06-28T21:00:00.000Z"
}
```

## 🔄 Continuous Testing

For ongoing testing, you can:
1. Set up a shorter cron interval during development
2. Use the test endpoint for quick verification
3. Monitor logs for scheduled execution
4. Set up automated tests in your CI/CD pipeline 