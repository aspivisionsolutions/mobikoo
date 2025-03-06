const express = require('express');
const Razorpay = require('razorpay'); // Import Razorpay SDK
const router = express.Router();
const InspectionReport = require('../models/inspectionReport'); // Import the InspectionReport model
require('dotenv').config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay key ID
    key_secret: process.env.RAZORPAY_KEY_SECRET // Replace with your Razorpay key secret
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
        const report = await InspectionReport.findById(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Inspection report not found' });
        }

        // Update the report with warranty details
        report.warrantyStatus = 'purchased'; // Update warranty status
        report.warrantyPlanId = planId; // Store the warranty plan ID
        report.razorpayPaymentId = razorpayPaymentId; // Store the payment ID if needed

        await report.save(); // Save the updated report

        res.status(200).json({ message: 'Warranty purchased successfully', report });
    } catch (error) {
        console.error('Error purchasing warranty:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
// ... other routes
