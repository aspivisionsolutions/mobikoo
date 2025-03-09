const express = require('express');
const router = express.Router();
const AdminLog = require('../models/adminlog');

// GET all logs for Admin Panel

router.get('/logs', async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', filterKeyword = '' } = req.query;

    try {
        const query = {
            $or: [
                { 'phoneChecker.name': { $regex: filterKeyword, $options: 'i' } },
                { 'shopOwner.shopDetails.shopName': { $regex: filterKeyword, $options: 'i' } },
                { 'invoiceDetails.invoiceId': { $regex: filterKeyword, $options: 'i' } },
                { 'invoiceDetails.buyerDetails.name': { $regex: filterKeyword, $options: 'i' } }
            ]
        };

        const logs = await AdminLog.find(query)
        .populate({
            path: 'phoneChecker',
            select: 'name email'  // Only fetch necessary fields
        })
        .populate({
            path: 'shopOwner',
            select: 'userId phoneNumber shopDetails.shopName shopDetails.address'
        })
            .populate('phoneDetails')
            .populate('warrantyDetails')
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({ logs, totalPages: Math.ceil(await AdminLog.countDocuments(query) / limit) });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching logs', details: error.message });
    }
});

// GET log by ID
router.get('/logs/:id', async (req, res) => {
    try {
        const log = await AdminLog.findById(req.params.id)
            .populate('phoneChecker', 'name email')
            .populate('shopOwner', 'name email')
            .populate('phoneDetails')
            .populate('warrantyDetails');

        if (!log) return res.status(404).json({ message: 'Log not found' });
        res.status(200).json(log);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching log', details: error.message });
    }
});

// POST - Create a new admin log entry
router.post('/logs', async (req, res) => {
    const { phoneChecker, shopOwner, phoneDetails, warrantyDetails, invoiceDetails } = req.body;
    if (!phoneChecker || !shopOwner || !phoneDetails || !warrantyDetails) {
        return res.status(400).json({ error: 'Missing required fields. Please fill all required details.' });
    }
    try {
        const newLog = new AdminLog({
            phoneChecker,
            shopOwner,
            phoneDetails,
            warrantyDetails,
            invoiceDetails
        });

        await newLog.save();
        res.status(201).json({ message: 'Admin log created successfully', newLog });
    } catch (error) {
        res.status(500).json({ error: 'Error creating log', details: error.message });
    }
});

module.exports = router;