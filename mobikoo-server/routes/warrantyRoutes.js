const express = require('express');
const router = express.Router();
const { 
    getAllWarrantyPlans,
    activateWarranty,
    getAllIssuedWarranties
} = require('../controllers/warrantyController');
const { protect, roleMiddleware } = require('../middlewares/authMiddleware');


// Get all warranty plans
router.get('/plans', getAllWarrantyPlans);

// Route to activate warranty
router.post('/activate-warranty', protect, roleMiddleware(['shop-owner']), activateWarranty);

// Route to fetch all issued warranties
router.get('/issued-warranties', getAllIssuedWarranties);




module.exports = router;
