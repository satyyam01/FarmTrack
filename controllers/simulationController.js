// const { Animal, ReturnLog, Yield } = require('../models'); 
const { Op } = require('sequelize');
const { format } = require('date-fns');

exports.handleScan = async (req, res) => {
    const { tag_number, location_id, payload, timestamp } = req.body; 

    console.log(`Simulating scan for tag: ${tag_number} at location: ${location_id}`);

    if (!tag_number || !location_id) {
        return res.status(400).json({ message: 'Missing required fields: tag_number and location_id' });
    }

    try {
        // 1. Find the animal by tag_number
        const animal = await Animal.findOne({ where: { tag_number: tag_number } });

        if (!animal) {
            console.log(`Animal with tag ${tag_number} not found.`);
            return res.status(404).json({ message: `Animal with tag ${tag_number} not found` });
        }

        console.log(`Found animal: ${animal.name} (ID: ${animal.id})`);

        // 2. Determine action based on location_id (case-insensitive)
        switch (location_id.toUpperCase()) {
            case 'BARN_ENTRANCE': { 
                const today = format(new Date(), 'yyyy-MM-dd');
                console.log(`Processing BARN_ENTRANCE for animal ${animal.id} on ${today}`);

                const [returnLog, created] = await ReturnLog.findOrCreate({
                    where: {
                        animal_id: animal.id,
                        date: today
                    },
                    defaults: { 
                        animal_id: animal.id,
                        date: today,
                        returned: true 
                    }
                });

                let message;
                if (!created && !returnLog.returned) {
                    returnLog.returned = true;
                    await returnLog.save();
                    message = `Updated night return status for ${animal.name} (ID: ${animal.id}) on ${today}.`;
                    console.log(message);
                } else if (created) {
                     message = `Created new night return log (returned) for ${animal.name} (ID: ${animal.id}) on ${today}.`;
                     console.log(message);
                } else {
                    message = `${animal.name} (ID: ${animal.id}) was already marked as returned on ${today}.`;
                    console.log(message);
                }
                return res.json({ message: message, returnLog: returnLog });
            } 

            case 'MILKING_STATION':
            case 'EGG_COLLECTION': { 
                console.log(`Processing ${location_id} for animal ${animal.id}`);
                if (!payload || payload.quantity === undefined || !payload.unit) { // Check quantity exists
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
                    unitType = 'Milk'; // Assuming 'Milk' is the expected value
                     if (!['Cow', 'Goat'].includes(animal.type)) { 
                         return res.status(400).json({ message: `Cannot log milk yield for animal type: ${animal.type}` });
                     }
                } else if (location_id.toUpperCase() === 'EGG_COLLECTION') {
                    unitType = 'Eggs'; // Assuming 'Eggs' is the expected value
                     if (animal.type !== 'Hen') { 
                         return res.status(400).json({ message: `Cannot log egg yield for animal type: ${animal.type}` });
                     }
                } else {
                    // Fallback or default if needed, though should be covered by case
                    unitType = 'Unknown'; 
                }

                const yieldDate = timestamp ? format(new Date(timestamp), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

                const newYield = await Yield.create({
                    animal_id: animal.id,
                    date: yieldDate,
                    quantity: quantity, 
                    unit: payload.unit,
                    unit_type: unitType
                });

                const message = `Logged ${quantity} ${payload.unit} (${unitType}) yield for ${animal.name} (ID: ${animal.id}) on ${yieldDate}.`;
                console.log(message);
                return res.status(201).json({ message: message, yield: newYield });
            }

            case 'HEALTH_CHECK_AREA':
                // For now, just return animal info
                // Could fetch recent checkups/meds here later
                return res.json({
                    message: `Fetched info for ${animal.name} at HEALTH_CHECK_AREA.`,
                    animal: animal // Return full animal object
                 });

            case 'GENERAL_IDENTIFICATION':
                 return res.json({
                    message: `Identified ${animal.name}.`,
                    animal: { id: animal.id, name: animal.name, type: animal.type, tag_number: animal.tag_number }
                 });

            default:
                console.log(`Unknown location_id: ${location_id}`);
                return res.status(400).json({ message: `Unknown location_id: ${location_id}` });
        }

    } catch (error) {
        console.error("Error handling simulated scan:", error);
        // Check for specific Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ 
                message: 'Validation error during scan simulation.', 
                errors: error.errors.map(e => ({ field: e.path, message: e.message })) 
            });
        }
        res.status(500).json({ message: 'Internal server error during scan simulation.', error: error.message });
    }
}; 