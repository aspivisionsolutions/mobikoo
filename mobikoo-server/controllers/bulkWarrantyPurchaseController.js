const BulkPurchase = require("../models/bulkWarrantyPurchase");

// Controller to handle bulk purchase of warranty plans
exports.purchaseBulkWarrantyPlans = async (req, res) => {
    try {
        const { planId, quantity } = req.body;

        const newPurchase = new BulkPurchase({ shopOwnerId: req.user.userId, planId, quantity });
        await newPurchase.save();
        res.status(201).json(newPurchase);
    } catch (error) {
        res.status(500).json({ message: "Error purchasing bulk warranty plans", error });
    }
};

// Controller to fetch all bulk purchases made by a shop owner
exports.getBulkPurchasesByShopOwner = async (req, res) => {
    try {
        const purchases = await BulkPurchase.find({ shopOwnerId: req.user.userId });
        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bulk purchases", error });
    }
}; 