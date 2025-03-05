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

module.exports = router;