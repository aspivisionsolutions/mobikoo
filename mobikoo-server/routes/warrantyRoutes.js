const express = require('express');
const router = express.Router();
const { 
    getAllWarrantyPlans,
    activateWarranty,
    getAllIssuedWarranties,
    claimWarranty,
    downloadWarrantyPDF
} = require('../controllers/warrantyController');
const { protect, roleMiddleware } = require('../middlewares/authMiddleware');
const ActivityLog = require('../models/activityLog'); // ✅ Import the Activity Log model




// Get all warranty plans
router.get('/plans', getAllWarrantyPlans);

// Route to activate warranty
router.post('/activate-warranty', protect, roleMiddleware(['shop-owner']), activateWarranty);

// Route to fetch all issued warranties
router.get('/issued-warranties', getAllIssuedWarranties);

router.post('/claim-warranty', protect, roleMiddleware(['customer']), claimWarranty);


module.exports = router;

// Route to download warranty PDF
router.get('/download-warranty/:warrantyId', protect, downloadWarrantyPDF);




module.exports = router;
