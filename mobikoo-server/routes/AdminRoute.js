const express = require('express');
const router = express.Router();
const PhoneChecker = require('../models/phoneChecker');
const ShopOwner = require('../models/shopOwner');
const Customer = require('../models/customer');
const User = require('../models/user');
const { protect, roleMiddleware } = require("../middlewares/authMiddleware");

// Middleware to restrict access to admins only
const adminOnly = roleMiddleware(['admin']);

// Get all users (phone checkers, customers, shop owners) - EXCLUDING admins
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } });
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
        // First find all non-admin users
        const nonAdminUsers = await User.find({ role: { $ne: 'admin' } }).select('_id');
        const nonAdminUserIds = nonAdminUsers.map(user => user._id);
        
        // Then find shop owners where userId is in the non-admin users list
        const shopOwners = await ShopOwner.find({ 
            userId: { $in: nonAdminUserIds },
            role: { $ne: 'admin' }
        }).populate('userId', 'firstName lastName email');
        
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
      
      // Update the base User document with name, email, phone
      const updatedUser = await User.findByIdAndUpdate(id, {
        firstName: req.body.firstName,
        email: req.body.email,
        phone: req.body.phone
      }, { new: true });
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update related models based on role
      if (updatedUser.role === 'shop-owner') {
        await ShopOwner.findOneAndUpdate(
          { userId: id },
          {
            $set: {
              phoneNumber: req.body.phone,
              shopDetails: {
                shopName: req.body.shopName,
                address: req.body.address
              }
            }
          }
        );
      } else if (updatedUser.role === 'phone-checker') {
        await PhoneChecker.findOneAndUpdate(
          { userId: id },
          {
            $set: {
              phoneNumber: req.body.phone,
              area: req.body.area
            }
          }
        );
      } else if (updatedUser.role === 'customer') {
        await Customer.findOneAndUpdate(
          { userId: id },
          {
            $set: {
              customerName: req.body.firstName,
              customerPhoneNumber: req.body.phone,
              customerAdhaarNumber: req.body.customerAdhaarNumber,
              customerEmailId: req.body.email
            }
          }
        );
      }
      
      res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
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
