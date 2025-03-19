const ShopOwner = require("../models/shopOwner");
const InspectionReport = require("../models/inspectionReport");
const IssuedWarranties = require("../models/issuedWarranties");
const Claim = require("../models/Claims");
const User = require("../models/user");

const PhoneChecker = require("../models/phoneChecker");
const InspectionRequest = require("../models/inspectionRequest");

exports.getShopOwnerStats = async (req, res) => {
    try {
        const shopOwner = await ShopOwner.findOne({ userId: req.user.userId });

        if (!shopOwner) {
            return res.status(404).json({ message: "Shop owner not found" });
        }

        // Count total inspection reports for the shop owner
        const totalInspectionReports = await InspectionReport.countDocuments({ shopName: shopOwner.shopDetails.shopName });

        // Count total issued warranties
        const totalIssuedWarranties = await IssuedWarranties.countDocuments();

        // Count total claims for the shop owner
        const totalClaims = await Claim.countDocuments({ shopOwner: shopOwner._id });

        res.status(200).json({
            success: true,
            stats: {
                totalInspectionReports,
                totalIssuedWarranties,
                totalClaims
            }
        });
    } catch (error) {
        console.error("Error fetching shop owner stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching shop owner stats",
            error: error.message
        });
    }
};

exports.getPhoneCheckerStats = async (req, res) => {
    try {
        const phoneChecker = await PhoneChecker.findOne({ userId: req.user.userId });

        if (!phoneChecker) {
            return res.status(404).json({ message: "Phone checker not found" });
        }

        // Count total reports created by the phone checker
        const totalReports = await InspectionReport.countDocuments({ inspectorId: req.user.userId });

        // Count total inspection requests assigned to the phone checker
        const totalInspectionRequests = await InspectionRequest.countDocuments({ inspectorId: req.user.userId });

        // Count total completed inspection requests
        const totalCompletedRequests = await InspectionRequest.countDocuments({ 
            inspectorId: req.user.userId, 
            status: 'completed' 
        });

        res.status(200).json({
            success: true,
            stats: {
                totalReports,
                totalInspectionRequests,
                totalCompletedRequests
            }
        });
    } catch (error) {
        console.error("Error fetching phone checker stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching phone checker stats",
            error: error.message
        });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        // Count total users
        const totalUsers = await User.countDocuments();

        // Count total inspection reports
        const totalInspections = await InspectionReport.countDocuments();

        // Count total claims
        const totalClaims = await Claim.countDocuments();

        // Count total issued warranties
        const totalWarranties = await IssuedWarranties.countDocuments();

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalInspections,
                totalClaims,
                totalWarranties
            }
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching admin stats",
            error: error.message
        });
    }
};
