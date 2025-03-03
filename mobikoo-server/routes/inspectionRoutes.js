const express = require("express");
const { protect, roleMiddleware } = require("../middlewares/authMiddleware");
const { createInspectionRequest, getInspectionRequestsForPhoneChecker, getInspectionRequestsByShopOwner, submitInspectionReport } = require("../controllers/inspectionController");

const router = express.Router();

// Create a new inspection request
router.post(
  "/create",
  protect,
  roleMiddleware(["shop-owner"]),
  createInspectionRequest // Use the controller function here
);

// Route to get all inspection requests for a phone checker
router.get(
  "/phoneChecker",
  protect,
  roleMiddleware(["phone-checker"]),
  getInspectionRequestsForPhoneChecker
);

// Route to get all inspection requests submitted by a shop owner
router.get(
  "/shopOwner",
  protect,
  roleMiddleware(["shop-owner"]),
  getInspectionRequestsByShopOwner
);

// Route to submit an inspection report by a phone checker
router.post(
  "/submitReport",
  protect,
  roleMiddleware(["phone-checker"]),
  submitInspectionReport // Use the controller function here
);

module.exports = router;
