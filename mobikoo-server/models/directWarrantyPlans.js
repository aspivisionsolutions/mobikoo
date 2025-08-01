const mongoose = require('mongoose');

const DirectWarrantyPlanSchema = new mongoose.Schema({
  range: { type: String, required: true },
  extendedWarranty1Year: { type: Number, required: true },
  extendedWarranty2Year: { type: Number, required: true },
  screenProtection1Year: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('DirectWarrantyPlan', DirectWarrantyPlanSchema);