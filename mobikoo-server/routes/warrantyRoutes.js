const express = require('express');
const router = express.Router();
const { 
    getAllWarrantyPlans, 
    issueWarranty, 
    getWarrantyDetails 
} = require('../controllers/warrantyController');
const { protect , roleMiddleware } = require('../middlewares/authMiddleware');

// Get all warranty plans
router.get('/plans', getAllWarrantyPlans);

// Issue a new warranty (only shop owners can issue warranties)
router.post('/issue', protect, roleMiddleware(['shop_owner']), issueWarranty);

// Get specific warranty details
router.get('/:warrantyId', protect, roleMiddleware(['shop_owner']), getWarrantyDetails);

module.exports = router;
