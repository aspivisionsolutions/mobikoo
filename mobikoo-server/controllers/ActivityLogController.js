// controllers/activityLogController.js
const ActivityLog = require('../models/activityLog');

exports.getActivityLogs = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'timestamp', order = 'desc', keyword = '' } = req.query;

    try {
        // Create a filter that matches your schema structure
        const filter = keyword ? {
            $or: [
                { actionType: { $regex: keyword, $options: 'i' } },
                { 'phoneDetails.model': { $regex: keyword, $options: 'i' } },
                { 'phoneDetails.imeiNumber': { $regex: keyword, $options: 'i' } },
                { 'warrantyDetails.planName': { $regex: keyword, $options: 'i' } }
            ]
        } : {};

        const logs = await ActivityLog.find(filter)
            .populate('shopOwner', 'firstName lastName email')
            .populate('phoneChecker', 'firstName lastName email')
            .populate('customer', 'customerName customerAdhaarNumber')
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
            .skip((page - 1) * parseInt(limit))
            .limit(parseInt(limit));


        // Transform data to match frontend expectations
        const formattedLogs = logs.map(log => ({
            _id: log._id,
            actionType: log.actionType,
            shopOwnerName: log.shopOwner?.firstName + " " + log.shopOwner?.lastName || 'N/A',
            phoneCheckerName: log.phoneChecker?.firstName + " " + log.phoneChecker?.lastName || 'N/A',
            customerName: log.customer?.customerName || 'N/A',
            imeiNumber: log.phoneDetails?.imeiNumber,
            planDuration: log.warrantyDetails?.duration,
            planPrice: log.warrantyDetails?.price,
            claimStatus: log.warrantyDetails?.claimStatus || 'N/A',
            timestamp: log.timestamp
        }));

        const total = await ActivityLog.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: formattedLogs,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                current: parseInt(page)
            }
        });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching activity logs',
            error: error.message
        });
    }
};