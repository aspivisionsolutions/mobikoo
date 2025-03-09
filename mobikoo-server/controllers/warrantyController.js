const WarrantyPlan = require('../models/warranties');
const InspectionReport = require('../models/inspectionReport');
const Customer = require('../models/customer');
const IssuedWarranties = require('../models/issuedWarranties');

// Get all warranty plans
exports.getAllWarrantyPlans = async (req, res) => {
    try {
        const plans = await WarrantyPlan.find();
        res.status(200).json({
            success: true,
            data: plans
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching warranty plans',
            error: error.message
        });
    }
};

// Function to activate warranty
exports.activateWarranty = async (req, res) => {
    const { 
        customerName, 
        customerPhoneNumber, 
        customerAdhaarNumber, 
        customerEmailId, 
        inspectionReportId,
        deviceModel,
        imeiNumber,
        grade
    } = req.body;

    try {
        // Find the inspection report by ID
        const report = await InspectionReport.findById(inspectionReportId);
        if (!report) {
            return res.status(404).json({ error: 'Inspection report not found' });
        }

        // Update the warranty status to activated
        report.warrantyStatus = 'activated';
        await report.save(); // Save the updated report

        // Create or update the customer details
        const customerData = {
            customerName,
            customerPhoneNumber,
            customerAdhaarNumber, // Include Aadhar number
            deviceDetails: inspectionReportId, // Link to the inspection report
            warrantyDetails: report.warrantyDetails,
            deviceModel,
            imeiNumber,
            grade,
            shopOwner: req.user.userId 
        };

        // Include emailId only if it is provided
        if (customerEmailId) {
            customerData.customerEmailId = customerEmailId;
        }

        const customer = await Customer.findOneAndUpdate(
            { customerAdhaarNumber }, // Use Aadhar number to find the customer
            customerData, // Use the constructed customerData object
            { new: true, upsert: true } // Create a new customer if not found
        );

        res.status(200).json({ message: 'Warranty activated successfully', customer });
    } catch (error) {
        console.error('Error activating warranty:', error);
        res.status(500).json({ error: error.message });
    }
};

// Function to get all issued warranties
exports.getAllIssuedWarranties = async (req, res) => {
    try {
        const issuedWarranties = await IssuedWarranties.find().populate('inspectionReport warrantyPlanId');
        res.status(200).json({
            success: true,
            data: issuedWarranties
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching issued warranties',
            error: error.message
        });
    }
};
