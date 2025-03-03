const express = require('express');
const router = express.Router();
const { 
    getAllWarrantyPlans
} = require('../controllers/warrantyController');
const { protect , roleMiddleware } = require('../middlewares/authMiddleware');


// Get all warranty plans
router.get('/plans', getAllWarrantyPlans);


module.exports = router;
