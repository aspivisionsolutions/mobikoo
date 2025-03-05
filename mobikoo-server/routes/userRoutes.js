const express = require('express');
const router = express.Router();
const PhoneChecker = require('../models/phoneChecker');
const ShopOwner = require('../models/shopOwner');
const { protect, roleMiddleware } = require("../middlewares/authMiddleware")

// Existing routes...

// New route to fetch all phone checkers in a specific area for a shop owner
router.get('/phone-checkers/:area', protect, roleMiddleware(['shop-owner']), async (req, res) => {
    try {
        const { area } = req.params;
        const phoneCheckers = await PhoneChecker.find({ area }).populate('userId');
        res.status(200).json(phoneCheckers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/shop-owners', protect , async (req, res) => {
    try {
        const shopOwners = await ShopOwner.find().populate('userId');
        res.status(200).json(shopOwners);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;