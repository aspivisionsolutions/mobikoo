const Claim = require('../models/Claims');
const Customer = require('../models/customer');
const IssuedWarranties = require('../models/issuedWarranties');
const ShopOwner = require('../models/shopOwner');
const warranties = require('../models/warranties');

// Submit a new claim request
exports.createClaim = async (req, res) => {
    try {
        console.log(req.body);
        const customer = await Customer.findById(req.body.selectedDevice);

        const shopOwner = await ShopOwner.findOne({ userId: customer.shopOwner });

        const newClaim = new Claim({
            customerDetails: customer._id,
            deviceDetails: customer.deviceDetails._id,
            warranties: customer.warrantyDetails._id,
            shopOwner: shopOwner._id,
            description: req.body.description,
        });
        await newClaim.save();
        res.status(201).json({ message: "Claim submitted successfully", claim: newClaim });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch all claim requests
exports.getAllClaims = async (req, res) => {
    try {
        const claims = await Claim.find().populate('deviceDetails customerDetails shopOwner')
            .populate({
                path: 'deviceDetails',
                populate: {
                    path: 'warrantyDetails',
                    model: IssuedWarranties,
                    populate: {
                        path: 'warrantyPlanId',
                        model: 'WarrantyPlan'
                    }
                }
            });
        res.status(200).json(claims);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch claim requests by customer name
exports.getClaimsByCustomerPhoneNumber = async (req, res) => {
    try {
        const { phone } = req.body;

        const customer = await Customer.findOne({ customerPhoneNumber: phone });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        console.log(customer, customer._id);
        const claims = await Claim.findOne({ customerDetails: customer._id }).populate('deviceDetails customerDetails shopOwner')
            .populate({
                path: 'deviceDetails',
                populate: {
                    path: 'warrantyDetails',
                    model: IssuedWarranties,
                    populate: {
                        path: 'warrantyPlanId',
                        model: 'WarrantyPlan'
                    }
                }
            });
        res.status(200).json(claims);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch claim requests by shop owner ID
exports.getClaimsByShopOwner = async (req, res) => {
    try {
        const shopOwnerId  = req.user.userId;
        console.log(shopOwnerId)
        const shopOwner = await ShopOwner.findOne({userId: shopOwnerId})
        if (!shopOwner) {
            return res.status(404).json({ message: "Shop owner not found" });
        }

        const claims = await Claim.find({ shopOwner: shopOwner._id }).populate('deviceDetails customerDetails shopOwner')
            .populate({
                path: 'deviceDetails',
                populate: {
                    path: 'warrantyDetails',
                    model: IssuedWarranties,
                    populate: {
                        path: 'warrantyPlanId',
                        model: 'WarrantyPlan'
                    }
                }
            });
        res.status(200).json(claims);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch claim requests for a particular device
exports.getClaimsByDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const claims = await Claim.find({ deviceDetails: deviceId }).populate('deviceDetails customerDetails shopOwner')
            .populate({
                path: 'deviceDetails',
                populate: {
                    path: 'warrantyDetails',
                    model: IssuedWarranties,
                    populate: {
                        path: 'warrantyPlanId',
                        model: 'WarrantyPlan'
                    }
                }
            });
        res.status(200).json(claims);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
