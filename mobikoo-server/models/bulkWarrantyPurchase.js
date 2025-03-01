const mongoose = require("mongoose");

const BulkPurchaseSchema = new mongoose.Schema({
  shopOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "WarrantyPlan", required: true },
  quantity: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("bulkPurchase", BulkPurchaseSchema);
