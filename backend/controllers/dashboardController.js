const Animal = require('../models/animal');
const Yield = require('../models/yield');
const ReturnLog = require('../models/returnLog');
const Notification = require('../models/notification');
const Setting = require('../models/setting');
const { getCache, setCache } = require('../utils/cache');

// Helper to get today's date as YYYY-MM-DD string
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

exports.getDashboardOverview = async (req, res) => {
  const farmId = req.user.farm_id;
  const cacheKey = `page:dashboard:overview:${farmId}`;
  try {
    // Check cache first
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    // Fetch animals
    const animals = await Animal.find({ farm_id: farmId });

    // Fetch today's yields overview
    const today = getTodayString();
    const animalIds = animals.map(a => a._id);
    const dailyYields = await Yield.find({ animal_id: { $in: animalIds }, date: today }).populate('animal_id');
    const yieldTotal = dailyYields.reduce((sum, y) => sum + Number(y.quantity), 0);

    // Fetch today's return logs
    const returnLogs = await ReturnLog.find({ date: today }).populate({
      path: 'animal_id',
      match: { farm_id: farmId },
      select: 'tag_number name type age gender'
    });
    const filteredReturnLogs = returnLogs.filter(log => log.animal_id !== null);

    // Fetch notifications
    const notifications = await Notification.find({ farm_id: farmId }).sort({ createdAt: -1 });

    // Fetch night check schedule (if exists)
    const nightCheckSetting = await Setting.findOne({ farm_id: farmId, key: 'night_check_schedule' });
    const nightCheckSchedule = nightCheckSetting ? nightCheckSetting.value : '21:00';

    const result = {
      animals,
      yields: {
        total: yieldTotal,
        yields: dailyYields
      },
      returnLogs: filteredReturnLogs,
      notifications,
      nightCheckSchedule
    };

    await setCache(cacheKey, result, 300); // 5 min TTL
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 