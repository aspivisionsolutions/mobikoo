const mongoose = require("mongoose");

const InspectionSchema = new mongoose.Schema({
  shopOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  phoneCheckerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Assigned later
  deviceIMEI: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
  requestedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

module.exports = mongoose.model("Inspection", InspectionSchema);
