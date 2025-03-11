// routes/activityLogRoutes.js
const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/ActivityLogController');
const { protect, roleMiddleware } = require('../middlewares/authMiddleware');

// Route to get activity logs (admin only)
router.get('/', protect, roleMiddleware(['admin']), getActivityLogs);

module.exports = router;