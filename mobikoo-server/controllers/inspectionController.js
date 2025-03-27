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

const crypto = require('crypto');
const {
    Cashfree
} = require('cashfree-pg');

Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

function generateOrderId() {
    const uniqueId = crypto.randomBytes(16).toString('hex');

    const hash = crypto.createHash('sha256');
    hash.update(uniqueId);

    const orderId = hash.digest('hex');

    return orderId.substr(0, 12);
}

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
  const { reportId, fineAmount, comment, inspectorId } = req.body;
  console.log(reportId);
  try {
    const inspectionRequest = await InspectionReport.findById(reportId).populate('inspectorId'); 
    if (!inspectionRequest) {
      return res.status(404).json({ message: "Inspection request not found" });
    }

    console.log(inspectionRequest);

    // Create and save the fine
    const fineReq = new Fine({
      fineAmount: fineAmount,
      comment: comment,
      inspectorId: inspectorId,
      inspectionId: reportId,
      status: "Unpaid" // Default status
    });

    await fineReq.save();

    // Fetch and format fine details after saving
    const fineDetails = await Fine.findById(fineReq._id)
      .populate({
        path: 'inspectorId',
        select: 'name' // Fetch Phone Checker name
      })
      .populate({
        path: 'inspectionId',
        select: 'deviceModel' // Fetch phone model
      });

      if (!fineDetails.inspectionId) {
        console.error("⚠️ Fine created but inspectionId is NULL!");
      }

    const formattedFine = {
      phoneChecker: fineDetails.inspectorId ? fineDetails.inspectorId.name : "Unknown",
      model: fineDetails.inspectionId ? fineDetails.inspectionId.deviceModel : "Unknown",
      amount: fineDetails.fineAmount,
      isPaid: fineDetails.status === "Paid",
      status: fineDetails.status
    };
  
    res.status(200).json({ message: "Fine added successfully", fine: formattedFine });
  } catch (error) {
    console.error("Error adding fine:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.updateFineStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    console.log(reportId, "reportId")
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

exports.payFine = async (req, res) => {
  try {
    const { fineId } = req.params;
    const {orderId} = req.body;
    console.log(fineId, "fineId")
    console.log(orderId,"ID")
    Cashfree.PGOrderFetchPayments("2025-01-01", orderId).then(async (response) => {

      try{
        const updatedFine = await Fine.findByIdAndUpdate(fineId, { status: 'Paid' }, { new: true }).populate('inspectorId').populate('inspectionId');
    if (!updatedFine) {
      return res.status(404).json({ message: "Fine not found" });
    }

    // Create an activity log entry
    await ActivityLog.create({
      actionType: 'Fine Paid',
      phoneChecker: updatedFine.inspectorId._id,
      phoneDetails: {
        model: updatedFine.inspectionId.deviceModel,
        imeiNumber: updatedFine.inspectionId.imeiNumber
      },
      timestamp: new Date()
    });
    
    res.status(200).json({ message: "Fine paid successfully", fine: updatedFine });
      }catch(error){
        console.error("Error paying fine:", error);
        res.status(500).json({ message: "Internal server error" });
      }
  }).catch(error => {
    console.error(error.response.data.message);
})
  } catch (error) {
    console.error("Error paying fine:", error);
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
        shopOwner: shopOwner ? shopOwner.userId : null,
        phoneChecker: req.user.userId,
        customer: null,
        phoneDetails: { model: reportData.deviceModel, imeiNumber: reportData.imeiNumber },
        warrantyDetails: {
          planName: null,
          price: null
        }
      });
    } catch (error) {
      console.error('Failed to create activity log:', error);
    }


    res.status(201).json(newReport);
  } catch (error) {
    console.error("Error submitting inspection report:", error);
    if (error.code === 11000 && error.keyPattern && error.keyPattern.imeiNumber) {
      res.status(400).json({ message: "IMEI number already exists. Please provide a unique IMEI number." });
    } else {
      res.status(500).json({ message: "Error submitting inspection report", error });
    }
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
  try {
    const report = await InspectionReport.findById(id).populate({
      path: 'warrantyDetails',
      populate: { path: 'warrantyPlanId' }
    }).populate('inspectorId');
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Create a PDF document with better page setup
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      bufferPages: true,
      autoFirstPage: true,
      info: {
        Title: `Inspection Report - ${id}`,
        Author: 'Your Company Name'
      }
    });
    
    let buffers = [];
    
    // Capture the PDF data in a buffer
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="inspection-report-${id}.pdf"`);

      res.status(200).send(pdfBuffer);
    });
    
    // Helper function to format dates nicely
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // Helper function for adding section headers
    const addSectionHeader = (title) => {
      doc.moveDown(0.5);
      doc.fillColor('#1e5180')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(title, { underline: false });
      doc.moveDown(0.5);
      // Add a horizontal line
      doc.strokeColor('#1e5180')
         .lineWidth(1)
         .moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .stroke();
      doc.moveDown(0.5);
      doc.fillColor('black').fontSize(12).font('Helvetica');
    };
    
    // Helper function to add a field with label and value
    const addField = (label, value, options = {}) => {
      const displayValue = value || 'N/A';
      
      if (options.highlight) {
        doc.font('Helvetica-Bold');
      }
      
      // If in two-column mode
      if (options.column) {
        const position = doc.x;
        doc.text(label + ':', { continued: true, width: 180 });
        doc.text(displayValue.toString(), { link: options.link });
        return;
      }
      
      doc.text(label + ':', { continued: true });
      doc.font('Helvetica').text(' ' + displayValue.toString(), { link: options.link });
      
      if (options.moveDown !== false) {
        doc.moveDown(0.5);
      }
    };
    
    // Add a logo if you have one
    /*
    try {
      doc.image('path/to/your/logo.png', 50, 45, { width: 150 });
    } catch (error) {
      console.error('Error loading logo:', error);
    }
    */
    
    // Add header with report title and ID
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#1e5180')
       .text('INSPECTION REPORT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14)
       .fillColor('#666666')
       .text(`Report ID: ${id}`, { align: 'center' });
    doc.moveDown(1);
    
    // Extract and organize the report data
    const reportObj = report.toObject();
    
    // Determine inspection date
    const inspectionDate = reportObj.inspectionDate || reportObj.createdAt;
    
    // Basic information section
    addSectionHeader('Basic Information');
    doc.font('Helvetica');
    
    // Two column layout for basic info
    const startY = doc.y;
    const leftColX = 50;
    const rightColX = 300;
    
    // Left column
    doc.x = leftColX;
    doc.y = startY;
    addField('Inspection Date', formatDate(inspectionDate));
    addField('Inspector Name', reportObj.inspectorId.firstName || reportObj.createdBy);
    if (reportObj.customerName) {
      addField('Customer Name', reportObj.customerName);
    }
    if (reportObj.contactInfo) {
      addField('Contact Info', reportObj.contactInfo);
    }
    
    // Right column
    doc.x = rightColX;
    doc.y = startY;
    if (reportObj.vehicleInfo) {
      addField('Vehicle Make', reportObj.vehicleInfo.make);
      addField('Vehicle Model', reportObj.vehicleInfo.model);
      addField('Vehicle Year', reportObj.vehicleInfo.year);
      addField('VIN', reportObj.vehicleInfo.vin);
    } else if (reportObj.propertyInfo) {
      addField('Property Type', reportObj.propertyInfo.type);
      addField('Property Address', reportObj.propertyInfo.address);
    }
    
    // Reset position for next section
    doc.x = 50;
    doc.y = Math.max(doc.y, startY + 120);
    
    // Inspection Details Section
    addSectionHeader('Inspection Details');
    
    // Filter out metadata and internal fields
    const detailsToSkip = ['id', '_v', 'createdAt', 'updatedAt', 'warrantyDetails', 'photos', 
                          'inspectorName', 'customerName', 'contactInfo', 'vehicleInfo', 'propertyInfo'];
    
    // Process remaining fields
    for (const [key, value] of Object.entries(reportObj)) {
      if (!detailsToSkip.includes(key) && typeof value !== 'object') {
        // Format the key to be more readable
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
        
        addField(formattedKey, value);
      }
    }
    
    // Add inspection findings/categories if they exist
    if (reportObj.findings || reportObj.categories) {
      addSectionHeader('Inspection Findings');
      
      const findings = reportObj.findings || reportObj.categories || [];
      
      if (Array.isArray(findings)) {
        findings.forEach((finding, index) => {
          doc.font('Helvetica-Bold')
             .text(`Finding ${index + 1}:`, { underline: true });
          doc.font('Helvetica');
          
          if (typeof finding === 'object') {
            for (const [key, value] of Object.entries(finding)) {
              if (key !== '_id') {
                const formattedKey = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase());
                
                addField(formattedKey, value);
              }
            }
          } else {
            doc.text(finding);
          }
          doc.moveDown();
        });
      } else if (typeof findings === 'object') {
        for (const [category, items] of Object.entries(findings)) {
          doc.font('Helvetica-Bold')
             .text(category, { underline: true });
          doc.font('Helvetica');
          
          if (Array.isArray(items)) {
            items.forEach(item => {
              doc.text(`${item}`);
            });
          } else if (typeof items === 'object') {
            for (const [key, value] of Object.entries(items)) {
              const formattedKey = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
              
              addField(formattedKey, value);
            }
          }
          doc.moveDown();
        }
      }
    }
    
    // Add warranty details if available
    if (report.warrantyDetails) {
      addSectionHeader('Warranty Information');
      
      const { warrantyPlanId, razorpayPaymentId } = report.warrantyDetails;
      
      // Add warranty plan details if populated
      if (warrantyPlanId) {
        const planDetails = warrantyPlanId.toObject();
        addField('Plan Name', planDetails.planName, { highlight: true });
        addField('Plan ID', planDetails._id);
        
        if (planDetails.coverage) {
          addField('Coverage', planDetails.coverage);
        }
        
        if (planDetails.duration) {
          addField('Duration', `${planDetails.duration} ${planDetails.durationUnit || 'days'}`);
        }
        
        if (planDetails.price) {
          addField('Price', `₹${planDetails.price.toLocaleString()}`);
        }
      }
      
      addField('Payment ID', razorpayPaymentId);
      
      if (report.warrantyDetails.startDate) {
        addField('Warranty Start Date', formatDate(report.warrantyDetails.startDate));
      }
      
      if (report.warrantyDetails.endDate) {
        addField('Warranty End Date', formatDate(report.warrantyDetails.endDate));
      }
    }
    
    // Add summary/notes section if available
    if (reportObj.summary || reportObj.notes || reportObj.conclusion) {
      addSectionHeader('Summary & Notes');
      doc.text(reportObj.summary || reportObj.notes || reportObj.conclusion);
      doc.moveDown();
    }
    
    
    
    // Add footer with page numbers
    let pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      // Add page number
      doc.fontSize(10)
         .fillColor('#999999')
         .text(
           `Page ${i + 1} of ${pageCount}`,
           50,
           doc.page.height - 50,
           { align: 'center' }
         );
      
      // Add company info in footer
      doc.fontSize(10)
         .fillColor('#999999')
         .text(
           'Your Company Name | contact@company.com | +1-234-567-8901',
           50,
           doc.page.height - 35,
           { align: 'center' }
         );
    }
    
    doc.end(); // Finalize the PDF and end the stream
  } catch (error) {
    console.error("Error downloading inspection report:", error);
    res.status(500).json({ message: "Error downloading inspection report", error: error.message });
  }
};

exports.getInspectionReportsForShopOwner = async (req, res) => {
  try {
    const shopOwner = await ShopOwner.findOne({ userId: req.user.userId });
    const reports = await InspectionReport.find({ shopOwnerId: shopOwner.shopOwnerId })
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


exports.deleteInspectionReport = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReport = await InspectionReport.findByIdAndDelete(id);

    if (!deletedReport) {
      return res.status(404).json({ message: "Inspection report not found" });
    }

    res.status(200).json({ message: "Inspection report deleted successfully" });
  } catch (error) {
    console.error("Error deleting inspection report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



