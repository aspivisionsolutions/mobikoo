const express = require('express');
const router = express.Router();
const { getShopOwnerStats } = require('../controllers/statsController');
const { protect, roleMiddleware } = require('../middlewares/authMiddleware'); // Assuming authentication middleware

// Route to fetch shop owner stats
router.get('/shop-owner', protect, roleMiddleware(['shop-owner']), getShopOwnerStats);

module.exports = router;