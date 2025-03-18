const Claim = require('../models/Claims');
const Customer = require('../models/customer');
const IssuedWarranties = require('../models/issuedWarranties');
const ShopOwner = require('../models/shopOwner');
const warranties = require('../models/warranties');
const ActivityLog = require('../models/activityLog');

// Submit a new claim request
exports.createClaim = async (req, res) => {
    try {
        const customer = await Customer.findById(req.body.selectedDevice);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const shopOwner = await ShopOwner.findOne({ userId: customer.shopOwner });
        if (!shopOwner) {
            return res.status(404).json({ message: "Shop owner not found" });
        }

        const newClaim = new Claim({
            customerDetails: customer._id,
            deviceDetails: customer.deviceDetails._id,
            warranties: customer.warrantyDetails._id,
            shopOwner: shopOwner._id,
            description: req.body.description,
            claimAmount: req.body.claimAmount
        });
        await newClaim.save();

        // Populate the newClaim object
        const populatedClaim = await Claim.findById(newClaim._id)
        .populate('deviceDetails customerDetails shopOwner')
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
        try {
            const newActivityLog = new ActivityLog({
                actionType: 'New Claim',
                shopOwner: shopOwner._id,
                customer: customer._id,
                phoneDetails: {
                    model: populatedClaim.deviceDetails.deviceModel,
                    imeiNumber: populatedClaim.deviceDetails.imeiNumber
                },
                warrantyDetails: {
                    planName: populatedClaim.deviceDetails.warrantyDetails.warrantyPlanId ? populatedClaim.deviceDetails.warrantyDetails.warrantyPlanId.planName : 'Unknown Plan',
                    price: populatedClaim.deviceDetails.warrantyDetails.warrantyPlanId ? populatedClaim.deviceDetails.warrantyDetails.warrantyPlanId.price : 0,
                    claimStatus: newClaim.claimStatus
                }
            });

            await newActivityLog.save();
        } catch (activityLogError) {
            console.error('Failed to create activity log:', activityLogError.message);
        }

        res.status(201).json({ message: "Claim submitted successfully", claim: populatedClaim });
    } catch (error) {
        console.error('Error creating claim:', error.message);
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
        const shopOwnerId = req.user.userId;
        console.log(shopOwnerId)
        const shopOwner = await ShopOwner.findOne({ userId: shopOwnerId })
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
// Approve a claim request
// Approve a claim request
exports.approveClaim = async (req, res) => {
    try {
        const { claimId } = req.params;

        const claim = await Claim.findById(claimId).populate({
            path: 'shopOwner',
            populate: { path: 'shopDetails' } // Ensure shopDetails is populated
        })
        .populate('customerDetails');
        // console.log(claim.shopOwner.shopDetails.ShopName)
        if (!claim) {
            return res.status(404).json({ message: "Claim not found" });
        }

        claim.claimStatus = "Approved";
        await claim.save();

        // Log approval in ActivityLog
        await ActivityLog.create({
            actionType: "Claim Approved",
            shopOwner: claim.shopOwner,
            customer: claim.customerDetails,
            phoneDetails: {
                model: claim.customerDetails.deviceModel,
                imeiNumber: claim.customerDetails.imeiNumber
            },
            warrantyDetails: {
                planName: claim.warranties ? claim.warranties.planName : "Unknown Plan",
                price: claim.warranties ? claim.warranties.price : 0,
                claimStatus: "Approved"
            }
        });

        res.status(200).json({ message: "Claim approved successfully", claim });
    } catch (error) {
        console.error("Error approving claim:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Reject a claim request
exports.rejectClaim = async (req, res) => {
    try {
        const { claimId } = req.params;

        const claim = await Claim.findById(claimId).populate({
            path: 'shopOwner',
            populate: { path: 'shopDetails' }}).populate('customerDetails');;;
        if (!claim) {
            return res.status(404).json({ message: "Claim not found" });
        }

        claim.claimStatus = "Rejected";
        await claim.save();

        // Log rejection in ActivityLog
        await ActivityLog.create({
            actionType: "Claim Rejected",
            shopOwner: claim.shopOwner,
            customer: claim.customerDetails,
            phoneDetails: {
                model: claim.customerDetails.deviceModel,
                imeiNumber: claim.customerDetails.imeiNumber
            },
            warrantyDetails: {
                planName: claim.warranties ? claim.warranties.planName : "Unknown Plan",
                price: claim.warranties ? claim.warranties.price : 0,
                claimStatus: "Approved"
            }
        });

        res.status(200).json({ message: "Claim rejected successfully", claim });
    } catch (error) {
        console.error("Error rejecting claim:", error.message);
        res.status(500).json({ error: error.message });
    }
};
