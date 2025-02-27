const InspectionReport = require("../models/inspectionReport");
const Inspection = require("../models/inspection");

// Submit an inspection report by phone checker
exports.submitReport = async (req, res) => {
  try {

    const newReport = {...req.body, phoneCheckerId: req.user.userId}

    const inspection = await Inspection.findOne({ deviceIMEI: newReport.deviceIMEI });
    if (!inspection) {
      return res.status(404).json({ message: "Inspection not found" });
    }

    if (inspection.status !== "in_progress") {
      return res.status(400).json({ message: "Inspection is not in progress" });
    }

    inspection.status = "completed";
    await inspection.save();
    
    const report = new InspectionReport(newReport);
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: "Error submitting report", error });
  }
};

exports.getReportByIMEI = async (req, res) => {
  try {
    const report = await InspectionReport.find({ deviceIMEI: req.params.deviceIMEI });
    res.json(report);
  } catch (error) {
    res.status(400).json({ message: "Error fetching report", error });
  }
};
