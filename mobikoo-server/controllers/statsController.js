const ShopOwner = require("../models/shopOwner");
const InspectionReport = require("../models/inspectionReport");
const IssuedWarranties = require("../models/issuedWarranties");
const Claim = require("../models/Claims");

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
