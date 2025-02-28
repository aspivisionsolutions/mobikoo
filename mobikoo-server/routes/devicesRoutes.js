const express = require('express');
const router = express.Router();
const Device = require('../models/device');
const IssuedWarranty = require('../models/issuedWarranties');
const { protect, roleMiddleware } = require('../middlewares/authMiddleware');

// 1. Fetch all devices with warranty information
router.get('/all', protect, roleMiddleware(['admin']), async (req, res) => {
    try {
        const devices = await Device.find();
        const devicesWithWarranty = await Promise.all(devices.map(async (device) => {
            const warranty = await IssuedWarranty.findOne({ deviceId: device._id })
                .populate('planId')
                .populate('shopOwnerId', 'name email')
                .populate('customerId', 'name email');
            return {
                ...device.toObject(),
                warranty: warranty || null
            };
        }));

        res.status(200).json(devicesWithWarranty);
    } catch (error) {
        res.status(500).json({ message: "Error fetching devices", error: error.message });
    }
});

// 2. Fetch devices of a specific customer with warranty information
router.get('/customer', protect, roleMiddleware(['customer', 'admin']), async (req, res) => {
    try {
        const customerId = req.user.userId;
        const devices = await Device.find({ OwnerID: customerId });
        
        const devicesWithWarranty = await Promise.all(devices.map(async (device) => {
            const warranty = await IssuedWarranty.findOne({ deviceId: device._id })
                .populate('planId')
                .populate('shopOwnerId', 'name email');
            return {
                ...device.toObject(),
                warranty: warranty || null
            };
        }));

        res.status(200).json(devicesWithWarranty);
    } catch (error) {
        res.status(500).json({ message: "Error fetching customer devices", error: error.message });
    }
});

// 3. Fetch devices for a shopowner who has issued the warranty
router.get('/shopowner', protect, roleMiddleware(['shop_owner', 'admin']), async (req, res) => {
    try {
        const shopOwnerId = req.user.userId;
        
        // First get all warranties issued by this shop owner
        const issuedWarranties = await IssuedWarranty.find({ shopOwnerId })
            .populate('deviceId')
            .populate('planId')
            .populate('customerId', 'name email');

        // Transform the data to match the expected format
        const devicesWithWarranty = issuedWarranties.map(warranty => ({
            ...warranty.deviceId.toObject(),
            warranty: {
                ...warranty.toObject(),
                deviceId: undefined // Remove redundant deviceId from warranty object
            }
        }));

        res.status(200).json(devicesWithWarranty);
    } catch (error) {
        res.status(500).json({ message: "Error fetching shopowner devices", error: error.message });
    }
});

module.exports = router;
