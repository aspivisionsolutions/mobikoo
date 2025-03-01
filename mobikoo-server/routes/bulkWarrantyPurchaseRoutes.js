const express = require("express");
const router = express.Router();
const bulkWarrantyPurchaseController = require("../controllers/bulkWarrantyPurchaseController");
const { protect, roleMiddleware } = require("../middlewares/authMiddleware");

// Route to purchase multiple warranty plans
router.post("/api/plans/bulk-purchase", protect, roleMiddleware(["shop_owner"]), bulkWarrantyPurchaseController.purchaseBulkWarrantyPlans);

// Route to fetch all bulk purchases made by a shop owner
router.get("/api/plans/shopOwner", protect, roleMiddleware(["shop_owner"]), bulkWarrantyPurchaseController.getBulkPurchasesByShopOwner);

module.exports = router; 