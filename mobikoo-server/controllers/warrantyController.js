const WarrantyPlan = require('../models/warranties');
const IssuedWarranty = require('../models/issuedWarranties');

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

// Issue a new warranty
exports.issueWarranty = async (req, res) => {
    try {
        const { customerId, deviceIMEI, planId } = req.body;
        
        // Get the warranty plan to calculate expiry date
        const warrantyPlan = await WarrantyPlan.findById(planId);
        if (!warrantyPlan) {
            return res.status(404).json({
                success: false,
                message: 'Warranty plan not found'
            });
        }

        // Calculate expiry date
        const startDate = new Date();
        const expiryDate = new Date(startDate);
        expiryDate.setMonth(expiryDate.getMonth() + warrantyPlan.durationMonths);

        // Create new warranty
        const newWarranty = await IssuedWarranty.create({
            shopOwnerId: req.user.userId, // Assuming shop owner ID is available in req.user after authentication
            customerId,
            deviceIMEI,
            planId,
            startDate,
            expiryDate
        });

        // Populate the warranty details
        const populatedWarranty = await IssuedWarranty.findById(newWarranty._id)
            .populate('planId')
            .populate('customerId', 'name email phone')
            .populate('shopOwnerId', 'email');

        res.status(201).json({
            success: true,
            data: populatedWarranty
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error issuing warranty',
            error: error.message
        });
    }
};

// Get specific warranty details
exports.getWarrantyDetails = async (req, res) => {
    try {
        const { warrantyId } = req.params;
        
        const warranty = await IssuedWarranty.findById(warrantyId)
            .populate('planId')
            .populate('customerId', 'name email phone')
            .populate('shopOwnerId', 'email');

        if (!warranty) {
            return res.status(404).json({
                success: false,
                message: 'Warranty not found'
            });
        }

        res.status(200).json({
            success: true,
            data: warranty
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching warranty details',
            error: error.message
        });
    }
}; 