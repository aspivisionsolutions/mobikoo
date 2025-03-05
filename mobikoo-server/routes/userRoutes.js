const express = require('express');
const router = express.Router();
const PhoneChecker = require('../models/phoneChecker');
const ShopOwner = require('../models/shopOwner');
const { protect, roleMiddleware } = require("../middlewares/authMiddleware");
const User = require('../models/user');

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

router.get('/shop-owner', protect , async (req, res) => {
    const userId = req.user.userId
    try {
        const shopowner = await User.findOne({_id:userId})

        console.log(shopowner)
        const shopprofile = await ShopOwner.find({userId:shopowner._id})
        if(!shopprofile){
            return res.status(404).json({message:"Shop profile not found"})
        }else{
            return res.status(200).json({message:"Shop profile found",shopprofile})
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// New route to fetch the phone checker profile for the logged-in user
router.get('/phone-checker', protect, async (req, res) => {
    const userId = req.user.userId;
    try {
        const phoneChecker = await PhoneChecker.findOne({ userId: userId }).populate('userId');
        if (!phoneChecker) {
            return res.status(404).json({ message: "Phone checker profile not found" });
        } else {
            return res.status(200).json({ message: "Phone checker profile found", phoneChecker });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Updated route to create or update a ShopOwner
router.post('/shop-owner', protect, async (req, res) => {
    const { shopName, address, phoneNumber } = req.body;
    const userId = req.user.userId;

    try {
        const updatedShopOwner = await ShopOwner.findOneAndUpdate(
            { userId }, // Find by userId
            {
                userId, // Include userId in the update
                phoneNumber,
                shopDetails: {
                    shopName,
                    address
                }
            },
            { new: true, upsert: true } // Create if not found, return the updated document
        );
        res.status(200).json({ message: "Shop owner created/updated successfully", updatedShopOwner });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Updated route to create or update a PhoneChecker
router.post('/phone-checker', protect, async (req, res) => {
    const { phoneNumber, area } = req.body;
    const userId = req.user.userId;

    try {
        const updatedPhoneChecker = await PhoneChecker.findOneAndUpdate(
            { userId }, // Find by userId
            {   
                userId, // Include userId in the update
                phoneNumber,
                area
            },
            { new: true, upsert: true } // Create if not found, return the updated document
        );
        res.status(200).json({ message: "Phone checker created/updated successfully", updatedPhoneChecker });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;