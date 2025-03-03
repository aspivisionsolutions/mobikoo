const WarrantyPlan = require('../models/warranties');

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
