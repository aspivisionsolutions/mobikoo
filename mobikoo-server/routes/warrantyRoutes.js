const express = require('express');
const router = express.Router();
const { 
    getAllWarrantyPlans, 
    issueWarranty, 
    getWarrantyDetails 
} = require('../controllers/warrantyController');
const { protect , roleMiddleware } = require('../middlewares/authMiddleware');
const IssuedWarranty = require('../models/issuedWarranties');
const User = require('../models/user');

// Get all warranty plans
router.get('/plans', getAllWarrantyPlans);

// Issue a new warranty (only shop owners can issue warranties)
router.post('/issue', protect, roleMiddleware(['shop_owner']), issueWarranty);

// Get specific warranty details
router.get('/:warrantyId', protect, roleMiddleware(['shop_owner']), getWarrantyDetails);

// Route to fetch all warranties issued by the authenticated shop owner
router.get('/customers-with-warranties', protect, roleMiddleware(['admin', 'shop_owner']), async (req, res) => {
    try {
        console.log("Authenticated User ID:", req.user.userId); // Debugging line

        // Fetch issued warranties where shopOwnerId matches the authenticated user's ID
        const issuedWarranties = await IssuedWarranty.find({ shopOwnerId: req.user.userId }).populate('customerId', 'name email phone');

        res.json(issuedWarranties);
    } catch (error) {
        console.error("Error fetching warranty details:", error); // Log the error for debugging
        res.status(500).json({ message: "Error fetching warranty details", error: error.message });
    }
});


module.exports = router;
