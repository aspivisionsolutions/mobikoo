const mongoose = require("mongoose");
const IssuedWarrantySchema = new mongoose.Schema({
    shopOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "devices", required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "WarrantyPlan", required: true },
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true }
  });
  
  module.exports = mongoose.model("issuedWarranties", IssuedWarrantySchema);