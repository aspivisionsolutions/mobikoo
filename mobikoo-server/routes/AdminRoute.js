const express = require('express');
const router = express.Router();
const PhoneChecker = require('../models/phoneChecker');
const ShopOwner = require('../models/shopOwner');
const Customer = require('../models/customer');
const User = require('../models/user');
const { protect, roleMiddleware } = require("../middlewares/authMiddleware");

// Middleware to restrict access to admins only
const adminOnly = roleMiddleware(['admin']);

// Get all users (phone checkers, customers, shop owners)
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get all phone checkers
router.get('/phone-checkers', protect, adminOnly, async (req, res) => {
    try {
        const phoneCheckers = await PhoneChecker.find({ role: { $ne: 'admin' } })
            .populate('userId', 'firstName lastName email');
        res.status(200).json(phoneCheckers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get all shop owners
router.get('/shop-owners', protect, adminOnly, async (req, res) => {
    try {
        const shopOwners = await ShopOwner.find({ role: { $ne: 'admin' } })
            .populate('userId', 'firstName lastName email');
        res.status(200).json(shopOwners);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get all customers (excluding admins)
router.get('/customers', protect, adminOnly, async (req, res) => {
    try {
        const customers = await Customer.find({ role: { $ne: 'admin' } })
            .populate('shopOwner');
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Edit user (phone checker, customer, or shop owner)
router.put('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Delete user and related profiles
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete associated records based on role
        if (user.role === 'phone-checker') {
            await PhoneChecker.findOneAndDelete({ userId: id });
        } else if (user.role === 'shop-owner') {
            await ShopOwner.findOneAndDelete({ userId: id });
        } else if (user.role === 'customer') {
            await Customer.findOneAndDelete({ userId: id });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
