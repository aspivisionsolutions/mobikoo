const express = require("express");
const { protect, roleMiddleware } = require("../middlewares/authMiddleware");
const { getDailyCustomerChange } = require("../controllers/customerController");

const router = express.Router();

// Route to track daily customer change for shop owner
router.get("/daily-customer-change", protect, roleMiddleware(["shop-owner"]), getDailyCustomerChange);

module.exports = router;
