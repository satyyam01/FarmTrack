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
    // Breakdown by unit_type for today
    const dailyMilk = dailyYields.filter(y => y.unit_type === 'milk').reduce((sum, y) => sum + Number(y.quantity), 0);
    const dailyEgg = dailyYields.filter(y => y.unit_type === 'egg').reduce((sum, y) => sum + Number(y.quantity), 0);

    // Weekly yields (from start of week to today)
    const startOfWeek = (() => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const start = new Date(now.setDate(diff));
      return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    })();
    const weeklyYields = await Yield.find({ animal_id: { $in: animalIds }, date: { $gte: startOfWeek, $lte: today } }).populate('animal_id');
    const weeklyMilk = weeklyYields.filter(y => y.unit_type === 'milk').reduce((sum, y) => sum + Number(y.quantity), 0);
    const weeklyEgg = weeklyYields.filter(y => y.unit_type === 'egg').reduce((sum, y) => sum + Number(y.quantity), 0);

    // Monthly yields (from start of month to today)
    const startOfMonth = (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    })();
    const monthlyYields = await Yield.find({ animal_id: { $in: animalIds }, date: { $gte: startOfMonth, $lte: today } }).populate('animal_id');
    const monthlyMilk = monthlyYields.filter(y => y.unit_type === 'milk').reduce((sum, y) => sum + Number(y.quantity), 0);
    const monthlyEgg = monthlyYields.filter(y => y.unit_type === 'egg').reduce((sum, y) => sum + Number(y.quantity), 0);

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

    // Fetch farm info (with premium fields)
    const Farm = require('../models/farm');
    const farm = await Farm.findById(farmId);
    const farmInfo = farm ? {
      name: farm.name,
      location: farm.location,
      isPremium: farm.isPremium,
      premiumExpiry: farm.premiumExpiry,
      animalLimit: farm.animalLimit,
      allowedRoles: farm.allowedRoles,
      subscription: farm.subscription
    } : null;

    // Animals producing today (have a yield entry for today)
    const producingAnimalIds = new Set(dailyYields.map(y => String(y.animal_id?._id || y.animal_id)));
    const animalsProducingToday = animals.filter(a => producingAnimalIds.has(String(a._id)));

    // Animals producing today by type (have a yield entry for today)
    const animalsByType = {
      Cow: animals.filter(a => a.type === 'Cow' && dailyYields.some(y => String(y.animal_id?._id || y.animal_id) === String(a._id))).length,
      Goat: animals.filter(a => a.type === 'Goat' && dailyYields.some(y => String(y.animal_id?._id || y.animal_id) === String(a._id))).length,
      Hen: animals.filter(a => a.type === 'Hen' && dailyYields.some(y => String(y.animal_id?._id || y.animal_id) === String(a._id))).length,
    };

    const result = {
      farmInfo,
      animals,
      animalsProducingToday: animalsProducingToday.length,
      yields: {
        total: yieldTotal,
        yields: dailyYields,
        daily: { milk: dailyMilk, egg: dailyEgg, animalsByType },
        weekly: { milk: weeklyMilk, egg: weeklyEgg },
        monthly: { milk: monthlyMilk, egg: monthlyEgg }
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