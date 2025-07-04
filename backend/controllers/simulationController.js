const Animal = require('../models/animal');
const Yield = require('../models/yield');
const ReturnLog = require('../models/returnLog');
const { format } = require('date-fns');

exports.handleScan = async (req, res) => {
    const { tag_number, location_id, payload, timestamp } = req.body;

    if (!tag_number || !location_id) {
        return res.status(400).json({ message: 'Missing required fields: tag_number and location_id' });
    }

    try {
        // 1. Find the animal by tag_number within the user's farm
        const animal = await Animal.findOne({ 
            tag_number: tag_number,
            farm_id: req.user.farm_id 
        });

        if (!animal) {
            return res.status(404).json({ message: `Animal with tag ${tag_number} not found in your farm` });
        }

        // 2. Determine action based on location_id (case-insensitive)
        switch (location_id.toUpperCase()) {
            case 'BARN_ENTRANCE': {
                const today = format(new Date(), 'yyyy-MM-dd');

                // Try to find an existing return log for today using string date
                let returnLog = await ReturnLog.findOne({ 
                    animal_id: animal._id, 
                    farm_id: req.user.farm_id,
                    date: today
                });
                let created = false;
                if (!returnLog) {
                    returnLog = await ReturnLog.create({
                        animal_id: animal._id,
                        farm_id: req.user.farm_id,
                        date: today,
                        returned: true
                    });
                    created = true;
                } else if (!returnLog.returned) {
                    returnLog.returned = true;
                    await returnLog.save();
                }

                let message;
                if (!created && !returnLog.returned) {
                    message = `Updated night return status for ${animal.name} (ID: ${animal._id}) on ${today}.`;
                } else if (created) {
                    message = `Created new night return log (returned) for ${animal.name} (ID: ${animal._id}) on ${today}.`;
                } else {
                    message = `${animal.name} (ID: ${animal._id}) was already marked as returned on ${today}.`;
                }
                return res.json({ message: message, returnLog: returnLog });
            }

            case 'MILKING_STATION':
            case 'EGG_COLLECTION': {
                if (!payload || payload.quantity === undefined || !payload.unit) {
                    return res.status(400).json({ message: 'Missing payload data (quantity, unit) for yield entry.' });
                }
                // Ensure quantity is a number
                const quantity = Number(payload.quantity);
                if (isNaN(quantity)) {
                    return res.status(400).json({ message: 'Invalid quantity in payload. Must be a number.' });
                }

                // Determine unit_type based on location or animal type
                let unitType;
                if (location_id.toUpperCase() === 'MILKING_STATION') {
                    unitType = 'milk'; // Lowercase for Mongoose schema
                    if (!['Cow', 'Goat'].includes(animal.type)) {
                        return res.status(400).json({ message: `Cannot log milk yield for animal type: ${animal.type}` });
                    }
                } else if (location_id.toUpperCase() === 'EGG_COLLECTION') {
                    unitType = 'egg'; // Lowercase for Mongoose schema
                    if (animal.type !== 'Hen') {
                        return res.status(400).json({ message: `Cannot log egg yield for animal type: ${animal.type}` });
                    }
                } else {
                    unitType = 'unknown';
                }

                const yieldDate = timestamp ? format(new Date(timestamp), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

                const newYield = await Yield.create({
                    animal_id: animal._id,
                    farm_id: req.user.farm_id,
                    date: yieldDate,
                    quantity: quantity,
                    unit_type: unitType
                });

                const message = `Logged ${quantity} (${unitType}) yield for ${animal.name} (ID: ${animal._id}) on ${yieldDate}.`;
                return res.status(201).json({ message: message, yield: newYield });
            }

            case 'HEALTH_CHECK_AREA':
                return res.json({
                    message: `Fetched info for ${animal.name} at HEALTH_CHECK_AREA.`,
                    animal: animal
                });

            case 'GENERAL_IDENTIFICATION':
                return res.json({
                    message: `Identified ${animal.name}.`,
                    animal: { id: animal._id, name: animal.name, type: animal.type, tag_number: animal.tag_number }
                });

            default:
                return res.status(400).json({ message: `Unknown location_id: ${location_id}` });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error during scan simulation.', error: error.message });
    }
}; 