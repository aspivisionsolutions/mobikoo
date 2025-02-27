const express = require("express");
const { protect, roleMiddleware } = require("../middlewares/authMiddleware");
const {
  submitReport,
  getReportByIMEI,
} = require("../controllers/inspectionReportControllers");

const router = express.Router();

// Submit an inspection report by phone checker
router.post("/submit", protect, roleMiddleware(["phone_checker"]), submitReport);

router.get("/:deviceIMEI", protect, roleMiddleware(["shop_owner"]), getReportByIMEI);

module.exports = router;
