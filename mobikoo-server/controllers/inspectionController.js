const InspectionRequest = require("../models/inspectionRequest");
const User = require("../models/user");
const ShopOwner = require("../models/shopOwner")
const InspectionReport = require("../models/inspectionReport");
const PhoneChecker = require("../models/phoneChecker");
const pdf = require("pdf-lib");
const PDFDocument = require('pdfkit');
const fs = require('fs'); // Required for file system operations
const ActivityLog = require('../models/activityLog');
const cloudinary = require('../cloudinary');
const multer = require('../multer');
const Fine = require("../models/fine");

exports.createInspectionRequest = async (req, res) => {
  const { area, inspectorId } = req.body;
  try {
    const shopOwner = await ShopOwner.findOne({ userId: req.user.userId })
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
exports.addFine = async (req, res) => {
  const { reportId, fineAmount, comment, inspectorId } = req.body; // Get ID from body
  console.log(reportId)
  try {
    const inspectionRequest = await InspectionReport.findById(reportId); // Use reportId from body
    if (!inspectionRequest) {
      return res.status(404).json({ message: "Inspection request not found" });
    }
    console.log(inspectionRequest)
    const fineReq = new Fine({
      fineAmount: fineAmount,
      comment:comment,
      inspectorId: inspectorId,
      inspectionId:reportId
    })
    
    await fineReq.save();
    res.status(200).json({ message: "Fine added successfully", inspectionRequest });
  } catch (error) {
    console.error("Error adding fine:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateFineStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    console.log(reportId)
    if (!reportId) {
      return res.status(400).json({ message: "Report ID is required" });
    }
    // Find and update the fineStatus in a single operation
    const updatedReport = await InspectionReport.findByIdAndUpdate(
      reportId,
      { $set: { fineStatus: "Fined" } }, // Use $set to explicitly update fineStatus
      { new: true } // Returns the updated document
    );
    if (!updatedReport) {
      console.log("Report Not Found")
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json({ message: "Fine status updated successfully", report: updatedReport });
  } catch (error) {
    console.error("Error updating fine status:", error);
    res.status(500).json({ message: "Internal server error" });
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

    const shopOwner = await ShopOwner.findOne({ userId: req.user.userId })

    const inspectionRequests = await InspectionRequest.find({ shopOwnerId: shopOwner._id }).populate('inspectorId');
    res.status(200).json(inspectionRequests);
  } catch (error) {
    console.error("Error fetching inspection requests by shop owner:", error);
    res.status(500).json({ message: "Error fetching inspection requests", error });
  }
};

// New function to submit an inspection report
exports.submitInspectionReport = async (req, res) => {
  console.log(req.body.photos)
  const reportData = req.body;

  console.log("Received reportData:", reportData);
  try {
    // Upload images to Cloudinary
    const imageUploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path));
    const imageUploadResults = await Promise.all(imageUploadPromises);
    const imageUrls = imageUploadResults.map(result => result.secure_url);

    // Create a new inspection report
    const newReport = new InspectionReport({
      ...reportData,
      photos: imageUrls,
      inspectionDate: new Date(),
      inspectorId: req.user.userId,
    });

    await newReport.save();

    const shopOwner = await ShopOwner.findOne({ 'shopDetails.shopName': reportData.shopName });
    try {
      // Create an activity log
      await ActivityLog.create({
        actionType: 'Inspection Report',
        shopOwner: shopOwner ? shopOwner._id : null,
        phoneChecker: req.user.userId,
        customer: null,
        phoneDetails: { model: reportData.deviceModel, imeiNumber: reportData.imeiNumber },
        warrantyDetails: {
          planName: null,
          price: null
        }
      });
    } catch (error) {
      console.error('Failed to create activity log:', error.message);
    }


    res.status(201).json(newReport);
  } catch (error) {
    console.error("Error submitting inspection report:", error);
    res.status(500).json({ message: "Error submitting inspection report", error });
  }
};

// New controller function to update the status of an inspection request
exports.updateInspectionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedRequest = await InspectionRequest.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedRequest) {
      return res.status(404).json({ message: "Inspection request not found" });
    }
    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getInspectionReportsForPhoneChecker = async (req, res) => {
  try {

    const phoneChecker = await PhoneChecker.findOne({ userId: req.user.userId });

    const reports = await InspectionReport.find({ inspectorId: req.user.userId }).populate('warrantyDetails');
    reports.inspectorId = phoneChecker;
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching inspection reports for phone checker:", error);
    res.status(500).json({ message: "Error fetching inspection reports", error });
  }
}

exports.downloadInspectionReport = async (req, res) => {
  const { id } = req.params;
  console.log(id)
  try {
    const report = await InspectionReport.findById(id).populate({
      path: 'warrantyDetails',
      populate: { path: 'warrantyPlanId' }
    });
    console.log(report)
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Create a PDF document
    const doc = new PDFDocument();
    let buffers = [];

    // Capture the PDF data in a buffer
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="inspection-report-${id}.pdf"`);
      res.status(200).send(pdfBuffer);
    });

    // Add content to the PDF dynamically
    doc.fontSize(25).text('Inspection Report', { align: 'center' });
    doc.moveDown();

    // Iterate over the report object and add each field to the PDF
    for (const [key, value] of Object.entries(report.toObject())) {
      // Format the key to be more readable
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      doc.fontSize(12).text(`${formattedKey}: ${value}`);
    }

    // Add warranty details if available
    if (report.warrantyDetails) {
      doc.moveDown();
      doc.fontSize(14).text('Warranty Details:', { underline: true });
      const { warrantyPlanId, razorpayPaymentId } = report.warrantyDetails;

      // Add warranty plan details if populated
      if (warrantyPlanId) {
        const planDetails = warrantyPlanId.toObject();
        doc.fontSize(12).text(`Warranty Plan ID: ${planDetails._id}`);
        doc.fontSize(12).text(`Plan Name: ${planDetails.planName}`);
      }
      doc.fontSize(12).text(`Payment ID: ${razorpayPaymentId}`);
    }

    // Check for photos and add them to the PDF
    if (report.photos && report.photos.length > 0) {
      doc.moveDown();
      doc.fontSize(14).text('Photos:', { underline: true });
      for (const photo of report.photos) {
        // Assuming photo is a URL or a path to the image
        try {
          // Add the image to the PDF
          doc.addPage(); // Add a new page for each photo
          doc.image(photo, { fit: [500, 400], align: 'center', valign: 'center' }); // Adjust size and position as needed
        } catch (error) {
          console.error(`Error adding image ${photo}:`, error);
          doc.text(`Error loading image: ${photo}`); // Fallback text if image fails to load
        }
      }
    }

    doc.end(); // Finalize the PDF and end the stream
  } catch (error) {
    console.error("Error downloading inspection report:", error);
    res.status(500).json({ message: "Error downloading inspection report", error });
  }
}

exports.getInspectionReportsForShopOwner = async (req, res) => {
  try {
    const shopOwner = await ShopOwner.findOne({ userId: req.user.userId });
    const reports = await InspectionReport.find({ shopName: shopOwner.shopDetails.shopName })
      .populate('inspectorId')
      .populate({
        path: 'warrantyDetails',
        populate: { path: 'warrantyPlanId' }
      })
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching inspection reports for shop owner:", error);
    res.status(500).json({ message: "Error fetching inspection reports", error });
  }
}


exports.getAllInspectionReports = async (req, res) => {
  try {
    const reports = await InspectionReport.find()

      .populate('inspectorId')
      .populate({
        path: 'warrantyDetails',
        populate: { path: 'warrantyPlanId' }
      })
      .sort({ createdAt: -1 });

    if (!reports || reports.length === 0) {
      return res.status(404).json({ message: "No inspection reports found" });
    }

    res.status(200).json({ reports });
  } catch (error) {
    res.status(500).json({ error: "Error fetching inspection reports", details: error.message });
  }
};



