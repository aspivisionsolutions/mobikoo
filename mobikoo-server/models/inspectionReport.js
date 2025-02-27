const mongoose = require("mongoose");

const InspectionReportSchema = new mongoose.Schema({
  inspectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Inspection", required: true },
  phoneCheckerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  photos: [{ type: String }], // Store URLs of uploaded photos
  videos: [{ type: String }], // Store URLs of uploaded videos
  notes: { type: String, required: true },
  hardwareCondition: { type: String, required: true },
  softwareCondition: { type: String, required: true },
  grade: { 
    type: String, 
    enum: ["A", "B", "C", "D"], 
    required: true,
    default: "C" 
  }, // Helps determine warranty eligibility
  createdAt: { type: Date, default: Date.now },
  deviceIMEI: { type: String, required: true },
});

module.exports = mongoose.model("InspectionReport", InspectionReportSchema);
