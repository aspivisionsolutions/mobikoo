const express = require('express');
const router = express.Router();
const DirectWarranties = require('../models/directWarranties');
const paymentController = require('../controllers/LandingPagePaymentController');

const { Cashfree } = require('cashfree-pg');
const crypto = require('crypto');

// Cashfree configuration
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// Helper to generate unique order IDs
function generateOrderId() {
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256');
    hash.update(uniqueId);
    const orderId = hash.digest('hex');
    return orderId.substr(0, 12);
}

// Dummy payment endpoints for landing page
router.post('/initiate', paymentController.initiatePayment);
router.post('/callback', paymentController.paymentCallback);

router.post('/create-device-protection-order', async (req, res) => {
    try {
        const { amount, customerDetails, deviceName } = req.body;
        let request = {
            "order_amount": amount,
            "order_currency": process.env.CURRENCY,
            "order_id": generateOrderId(),
            "customer_details": {
                "customer_id": customerDetails?.phone || "guest",
                "customer_phone": customerDetails?.phone || "9999999999",
                "customer_name": customerDetails?.name || "Guest User",
                "customer_email": customerDetails?.email || "guest@example.com"
            },
            "order_note": `Device Protection for ${deviceName || "Device"}`
        };

        const response = await Cashfree.PGCreateOrder("2025-01-01", request);
        res.json(response.data);
    } catch (error) {
    console.error('Cashfree order error:', error);
    res.status(500).json({ 
        error: error.response?.data?.message || error.message || 'Payment gateway error'
    });
}
});

// In your backend, add a callback endpoint:
router.post('/device-protection/payment-callback', async (req, res) => {
    // You can get order_id from req.body or req.query
    const { order_id, payment_status } = req.body;
    // Fetch order details from your DB (if you stored them)
    // Or fetch from Cashfree API if needed
    // Log all details
    console.log('Payment Success:', { order_id, payment_status /*, ...other details */ });
    res.sendStatus(200);
});

router.post('/add/direct-warranty', async (req, res)=>{

    try {
        const { paymentOrderId, deviceDetails, customerDetails, planDetails } = req.body;
        const directWarranty = {
            paymentOrderId,
            deviceDetails,
            customerDetails: {
                customerName: customerDetails?.name,
                customerEmail: customerDetails?.email,
                customerPhone: customerDetails?.phone,
            },
            planDetails
        };
        // Here you would typically save the directWarranty to your database
        const newWarranty = new DirectWarranties(directWarranty);
        await newWarranty.save();
        console.log(req.body);
        console.log(directWarranty);

        // For now, we just return it as a response
        res.status(201).json(newWarranty);
    } catch (error) {
        console.error('Error adding direct warranty:', error);
        res.status(500).json({ error: 'Failed to add direct warranty' });
    }

});

router.get('/get/direct-warranties', async (req, res) => {
    try {
        const directWarranties = await DirectWarranties.find({});
        res.status(200).json(directWarranties);
    } catch (error) {
        console.error('Error fetching direct warranties:', error);
        res.status(500).json({ error: 'Failed to fetch direct warranties' });
    }
});

module.exports = router;