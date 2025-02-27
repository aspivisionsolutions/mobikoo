const express = require("express");
const router = express.Router();
const { protect, roleMiddleware } = require("../middlewares/authMiddleware");
const Inspection = require("../models/inspection");

// Create new inspection (Shop owners only)
router.post("/create", 
  protect, 
  roleMiddleware(["shop_owner"]), 
  async (req, res) => {
    try {
      const { deviceIMEI, brand, model } = req.body;

      // Validate required fields
      if (!deviceIMEI || !brand || !model) {
        return res.status(400).json({ message: "Please provide all required fields" });
      }

      // Check if device IMEI already exists
      const existingInspection = await Inspection.findOne({ deviceIMEI });
      if (existingInspection) {
        return res.status(400).json({ message: "Device with this IMEI already exists" });
      }

      // Create new inspection
      console.log(req.user);
      const inspection = new Inspection({
        shopOwnerId: req.user.userId,
        deviceIMEI,
        brand,
        model,
        status: "in_progress",
        requestedAt: Date.now()
      });

      await inspection.save();

      res.status(201).json(inspection);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
});

// Get inspection details
router.get("/:inspectionId", 
  protect, 
  roleMiddleware(["admin", "shop_owner", "phone_checker"]), 
  async (req, res) => {
    try {
      const inspection = await Inspection.findById(req.params.inspectionId)
        .populate("shopOwnerId", "firstName lastName email")
        .populate("phoneCheckerId", "firstName lastName email");
      
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }

      // Additional check for shop_owner and phone_checker
      if (req.user.role !== "admin" && 
          inspection.shopOwnerId._id.toString() !== req.user.userId &&
          inspection.phoneCheckerId?._id.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Not authorized to view this inspection" });
      }

      res.json(inspection);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
});

// Get shop owner's inspections
router.get("/shop-owner/inspections", 
  protect, 
  roleMiddleware(["shop_owner"]), 
  async (req, res) => {
    try {
      const inspections = await Inspection.find({ shopOwnerId: req.user.userId })
        .populate("phoneCheckerId", "firstName lastName email")
        .sort({ requestedAt: -1 });

      res.json(inspections);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
