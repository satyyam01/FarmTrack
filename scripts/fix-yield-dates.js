const mongoose = require('mongoose');
require('dotenv').config();
const Yield = require('../models/yield');

mongoose.connect(process.env.MONGODB_URI, {});

async function fixYieldDates() {
  const yields = await Yield.find({});
  let updated = 0;
  for (const y of yields) {
    let newDate = y.date;
    // If the date is a full string with time, convert to YYYY-MM-DD
    if (typeof y.date === 'string' && y.date.includes('GMT')) {
      const d = new Date(y.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      newDate = `${year}-${month}-${day}`;
      await Yield.findByIdAndUpdate(y._id, { date: newDate });
      console.log(`Updated ${y._id}: ${y.date} -> ${newDate}`);
      updated++;
    } else if (typeof y.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(y.date)) {
      // Already correct format
      continue;
    } else if (y.date instanceof Date) {
      // If somehow still a Date object
      const year = y.date.getFullYear();
      const month = String(y.date.getMonth() + 1).padStart(2, '0');
      const day = String(y.date.getDate()).padStart(2, '0');
      newDate = `${year}-${month}-${day}`;
      await Yield.findByIdAndUpdate(y._id, { date: newDate });
      console.log(`Updated ${y._id}: [Date object] -> ${newDate}`);
      updated++;
    }
  }
  console.log(`Done! Updated ${updated} yields.`);
  mongoose.connection.close();
}

fixYieldDates(); 