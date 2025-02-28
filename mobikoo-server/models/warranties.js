const mongoose = require("mongoose");

const WarrantyPlanSchema = new mongoose.Schema({
    planName: { type: String, required: true },
    durationMonths: { type: Number, required: true },
    coverageDetails: { type: String, required: true },
    price: { type: Number, required: true }
  });
  
  module.exports = mongoose.model("WarrantyPlan", WarrantyPlanSchema);