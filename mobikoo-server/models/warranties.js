const mongoose = require("mongoose");

const WarrantyPlanSchema = new mongoose.Schema({
  lower_limit: { type: Number, required: true, min: 0 },
  upper_limit: { type: Number, required: false, min: 0 },
  grade: { type: String, enum: ["A", "B", "C"], required: true },
  price: { type: Number, required: true, min: 0 },
  warranty_months: { type: Number, required: true, min: 1 }
});

module.exports = mongoose.model("WarrantyPlan", WarrantyPlanSchema);