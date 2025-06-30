const express = require('express');
const router = express.Router();
const { createFarm, getFarms, getFarmById, updateFarm, deleteFarm } = require('../controllers/farmController');
const { authenticate, requireFarmOwner } = require('../middleware/auth');

router.post('/', authenticate, createFarm);
router.get('/', authenticate, getFarms);
router.get('/:id', authenticate, getFarmById);
router.put('/:id', authenticate, requireFarmOwner, updateFarm);
router.delete('/:id', authenticate, requireFarmOwner, deleteFarm);

module.exports = router;
// This route allows authenticated users to create and view farms.