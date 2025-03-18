const express = require('express');
const Razorpay = require('razorpay'); // Import Razorpay SDK
const router = express.Router();
const InspectionReport = require('../models/inspectionReport'); // Import the InspectionReport model
const IssuedWarranties = require('../models/issuedWarranties'); // Import the IssuedWarranties model
require('dotenv').config();
const { protect } = require('../middlewares/authMiddleware')
const ActivityLog = require('../models/activityLog');
const ShopOwner = require('../models/shopOwner');
const warranties = require('../models/warranties');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Order POST endpoint
router.post('/create-order', async (req, res) => {
    try {

        const { amount, receipt, notes } = req.body; // Extract amount and currency from request body

        const options = {
            amount: amount * 100, // Amount in paise
            currency: process.env.CURRENCY,
            receipt,
            notes
        };

        const order = await razorpay.orders.create(options);
        res.json(order);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/payment/success', (req, res) => {
    res.send('Payment successful');
});

router.get('/payment/failure', (req, res) => {
    res.send('Payment failed');
});

// Route to handle warranty purchase
router.post('/warranty/purchase', async (req, res) => {
    const { reportId, deviceModel, imeiNumber, grade, planId, razorpayPaymentId } = req.body;

    try {
        // Find the inspection report by ID
        const report = await InspectionReport.findById(reportId).populate('inspectorId').populate({
            path: 'warrantyDetails',
            populate: { path: 'warrantyPlanId' }
        });
        if (!report) {
            return res.status(404).json({ error: 'Inspection report not found' });
        }

        const plan = await warranties.findById(planId);
        if (!plan) {
            return res.status(404).json({ error: 'Warranty plan not found' });
        }

        // Create a new IssuedWarranties object
        const newIssuedWarranty = new IssuedWarranties({
            inspectionReport: reportId, // Link to the inspection report
            warrantyPlanId: planId, // Store the warranty plan ID
            razorpayPaymentId: razorpayPaymentId, // Store the payment ID
            issueDate: new Date().toISOString().split('T')[0],
            phoneChecker: report.inspectorId._id,
        });

        // Save the issued warranty
        await newIssuedWarranty.save();

        // Update the report with warranty details
        report.warrantyStatus = 'purchased'; // Update warranty status
        report.warrantyDetails = newIssuedWarranty._id; // Link the issued warranty to the report

        await report.save(); // Save the updated report

        // Fetch the shop owner using the shop name in the issued warranty object
        const shopOwner = await ShopOwner.findOne({ 'shopDetails.shopName': report.shopName });
        try {
            // Create an activity log
        await ActivityLog.create({
            actionType: 'Warranty Purchased',
            shopOwner: shopOwner ? shopOwner._id : null,
            phoneChecker: report.inspectorId._id,
            customer: null,
            phoneDetails: { model: report.deviceModel, imeiNumber: report.imeiNumber },
            warrantyDetails: {
                planName: plan.planName,
                price: plan.price
            }
        });
        } catch (error) {
            console.error('Failed to create activity log:', error.message);
        }

        res.status(200).json({ message: 'Warranty purchased successfully', report });
    } catch (error) {
        console.error('Error purchasing warranty:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to handle bulk warranty purchase
router.post('/warranty/bulk-purchase', protect, async (req, res) => {
    const { purchaseDetails, razorpayPaymentId } = req.body; // Extract purchaseDetails from request body

    try {
        // Create an array to hold the report IDs for updating
        const reportIds = purchaseDetails.map(detail => detail.reportId);

        // Find all inspection reports by IDs
        const reports = await InspectionReport.find({ _id: { $in: reportIds } });
        if (!reports || reports.length === 0) {
            return res.status(404).json({ error: 'No inspection reports found' });
        }

        // Update each report with warranty details
        const updatedReports = await Promise.all(reports.map(async (report) => {
            const purchaseDetail = purchaseDetails.find(detail => detail.reportId.toString() === report._id.toString());
            if (purchaseDetail) {
                // Create a new IssuedWarranties object for each report
                const newIssuedWarranty = new IssuedWarranties({
                    inspectionReport: report._id, // Link to the inspection report
                    warrantyPlanId: purchaseDetail.planId, // Store the corresponding planId
                    razorpayPaymentId: razorpayPaymentId,
                    issueDate: new Date().toISOString().split('T')[0],
                });

                // Save the issued warranty
                await newIssuedWarranty.save();

                // Update the report with warranty details
                report.warrantyStatus = 'purchased'; // Update warranty status
                report.warrantyDetails = newIssuedWarranty._id; // Link the issued warranty to the report

                await report.save(); // Save the updated report
            }
            return report;
        }));

        res.status(200).json({ message: 'Bulk warranty purchased successfully', reports: updatedReports });
    } catch (error) {
        console.error('Error purchasing bulk warranty:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
// ... other routes
