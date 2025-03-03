const InspectionRequest = require("../models/inspectionRequest");
const User = require("../models/user");
const ShopOwner = require("../models/shopOwner")
const InspectionReport = require("../models/inspectionReport");

exports.createInspectionRequest = async (req, res) => {
  const { area, inspectorId } = req.body;
  try {

    const shopOwner = await ShopOwner.findOne({userId: req.user.userId})

    const newInspectionRequest = new InspectionRequest({
      shopOwnerId: shopOwner._id,
      inspectorId,
      status: "pending", 
      area, 
    });

    const savedRequest = await newInspectionRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    // Log the error to understand what went wrong
    console.error("Error creating inspection request:", error);
    res.status(500).json({ message: "Error creating inspection request", error });
  }
};

// New function to get all inspection requests for a phone checker
exports.getInspectionRequestsForPhoneChecker = async (req, res) => {
  try {
    const inspectionRequests = await InspectionRequest.find({ inspectorId: req.user.userId }).populate('shopOwnerId');
    res.status(200).json(inspectionRequests);
  } catch (error) {
    console.error("Error fetching inspection requests for phone checker:", error);
    res.status(500).json({ message: "Error fetching inspection requests", error });
  }
};

// New function to get all inspection requests submitted by a shop owner
exports.getInspectionRequestsByShopOwner = async (req, res) => {
  try {

    const shopOwner = await ShopOwner.findOne({userId: req.user.userId})

    const inspectionRequests = await InspectionRequest.find({ shopOwnerId: shopOwner._id }).populate('inspectorId');
    res.status(200).json(inspectionRequests);
  } catch (error) {
    console.error("Error fetching inspection requests by shop owner:", error);
    res.status(500).json({ message: "Error fetching inspection requests", error });
  }
};

// New function to submit an inspection report
exports.submitInspectionReport = async (req, res) => {
  const { inspectionRequestId, reportData } = req.body; // reportData contains the inspection report details
  try {
    // Create a new inspection report
    const newReport = new InspectionReport({
      ...reportData,
      inspectionRequestId,
    });

    // Save the report
    await newReport.save();

    // Update the status of the inspection request
    await InspectionRequest.findByIdAndUpdate(inspectionRequestId, { status: 'completed' });

    res.status(201).json(newReport);
  } catch (error) {
    console.error("Error submitting inspection report:", error);
    res.status(500).json({ message: "Error submitting inspection report", error });
  }
}; 