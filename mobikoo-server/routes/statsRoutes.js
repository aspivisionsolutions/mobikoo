const express = require('express');
const router = express.Router();
const { getShopOwnerStats, getPhoneCheckerStats, getAdminStats } = require('../controllers/statsController');
const { protect, roleMiddleware } = require('../middlewares/authMiddleware'); // Assuming authentication middleware

// Route to fetch shop owner stats
router.get('/shop-owner', protect, roleMiddleware(['shop-owner']), getShopOwnerStats);

router.get('/phone-checker', protect, roleMiddleware(['phone-checker']), getPhoneCheckerStats);

router.get('/admin', protect, roleMiddleware(['admin']), getAdminStats);

module.exports = router;