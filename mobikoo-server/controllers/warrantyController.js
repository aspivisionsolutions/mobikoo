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
const ActivityLog = require('../models/activityLog');

exports.activateWarranty = async (req, res) => {
    const { 
        customerName, 
        customerPhoneNumber, 
        customerAdhaarNumber, 
        customerEmailId,
        inspectionReportId,
        deviceModel,
        imeiNumber,
        grade,
        phoneCheckerId  // For tracking the PhoneChecker
    } = req.body;

    try {
        const report = await InspectionReport.findById(inspectionReportId);
        if (!report) return res.status(404).json({ error: 'Inspection report not found' });

        report.warrantyStatus = 'activated';
        await report.save();

        const customerData = await Customer.findOneAndUpdate(
            {
                customerName,
                customerPhoneNumber,
                customerAdhaarNumber,
                deviceDetails: inspectionReportId,
                warrantyDetails: report.warrantyDetails,
                deviceModel,
                imeiNumber,
                grade,
                shopOwner: req.user.userId
            },
            { new: true, upsert: true }
        );
        if (customerEmailId) {
            customerData.customerEmailId = customerEmailId;
        }
        const customer = await Customer.findOneAndUpdate(
            { customerAdhaarNumber }, // Use Aadhar number to find the customer
            customerData, // Use the constructed customerData object
            { new: true, upsert: true } // Create a new customer if not found
        );
        // Log the purchase in the Activity Log
        await ActivityLog.create({
            actionType: 'Warranty Purchased',
            shopOwner: req.user.userId,
            phoneChecker: phoneCheckerId,
            customer: customer._id,
            phoneDetails: { model: deviceModel, imeiNumber },
            warrantyDetails: report.warrantyDetails
        });

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

exports.claimWarranty = async (req, res) => {
    const { imeiNumber, customerAdhaarNumber } = req.body;

    try {
        const customer = await Customer.findOne({
            imeiNumber,
            customerAdhaarNumber
        }).populate('warrantyDetails');

        if (!customer) {
            return res.status(404).json({ error: 'Warranty details not found or invalid details provided.' });
        }

        const issuedWarranty = await IssuedWarranties.findById(customer.warrantyDetails);
        if (!issuedWarranty) {
            return res.status(404).json({ error: 'Issued warranty record not found.' });
        }

        // Get warranty plan for details
        const warrantyPlan = await WarrantyPlan.findById(issuedWarranty.warrantyPlanId);

        // Log the warranty claim
        await ActivityLog.create({
            actionType: 'Warranty Claimed',
            shopOwner: customer.shopOwner, // Shop that sold the warranty
            customer: customer._id,
            phoneDetails: {
                model: customer.deviceModel,
                imeiNumber: customer.imeiNumber
            },
            warrantyDetails: {
                planName: warrantyPlan ? warrantyPlan.name : 'Unknown Plan',
                price: warrantyPlan ? warrantyPlan.price : 0,
                claimStatus: 'Pending'  // Initial status for claims
            }
        });

        res.status(200).json({
            success: true,
            message: 'Warranty claim successful. Your claim is under review.',
            warrantyDetails: issuedWarranty
        });
    } catch (error) {
        console.error('Error claiming warranty:', error);
        res.status(500).json({ error: 'Server error while claiming warranty.' });
    }
};

