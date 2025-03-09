const express = require("express");
const { protect, roleMiddleware } = require("../middlewares/authMiddleware");
const { createInspectionRequest, getInspectionRequestsForPhoneChecker, getInspectionRequestsByShopOwner, submitInspectionReport, updateInspectionStatus, getInspectionReportsForPhoneChecker, downloadInspectionReport, getInspectionReportsForShopOwner } = require("../controllers/inspectionController");
const { getAllInspectionReports } = require('../controllers/inspectionController');




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
router.get(
  "/admin/reports",
  protect,
  roleMiddleware(["admin"]),
  getAllInspectionReports // Controller function for admin reports
);


// Route to submit an inspection report by a phone checker
router.post(
  "/submitReport",
  protect,
  roleMiddleware(["phone-checker"]),
  submitInspectionReport // Use the controller function here
);

// New route to update the status of an inspection request
router.patch(
  "/:id",
  protect,
  roleMiddleware(["phone-checker"]),
  updateInspectionStatus // Use the new controller function here
);

router.get("/phoneChecker/reports", protect, roleMiddleware(["phone-checker"]), getInspectionReportsForPhoneChecker);

router.get("/shopOwner/reports", protect, roleMiddleware(["shop-owner"]), getInspectionReportsForShopOwner);

router.get("/reports/:id/download", protect, roleMiddleware(["phone-checker"]), downloadInspectionReport);
router.get('/admin/reports', protect, roleMiddleware(["admin"]),getAllInspectionReports);

module.exports = router;
