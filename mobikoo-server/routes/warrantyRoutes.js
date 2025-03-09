const express = require('express');
const router = express.Router();
const { 
    getAllWarrantyPlans,
    activateWarranty
} = require('../controllers/warrantyController');
const { protect, roleMiddleware } = require('../middlewares/authMiddleware');


// Get all warranty plans
router.get('/plans', getAllWarrantyPlans);

// Route to activate warranty
router.post('/activate-warranty', protect, roleMiddleware(['shop-owner']), activateWarranty);




module.exports = router;
