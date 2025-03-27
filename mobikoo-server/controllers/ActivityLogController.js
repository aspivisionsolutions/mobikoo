// controllers/activityLogController.js
const ActivityLog = require('../models/activityLog');
const ShopOwner = require('../models/shopOwner');

exports.getActivityLogs = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'timestamp', order = 'desc', keyword = '' } = req.query;

    try {
        const filter = keyword ? {
            $or: [
                { actionType: { $regex: keyword, $options: 'i' } },
                { 'phoneDetails.model': { $regex: keyword, $options: 'i' } },
                { 'phoneDetails.imeiNumber': { $regex: keyword, $options: 'i' } },
                { 'warrantyDetails.planName': { $regex: keyword, $options: 'i' } }
            ]
        } : {};

        // Step 1: Fetch logs with shopOwner as User
        const logs = await ActivityLog.find(filter)
            .populate('shopOwner', 'firstName lastName email') // Fetch only basic details from User
            .populate('phoneChecker', 'firstName lastName email')
            .populate('customer', 'customerName customerAdhaarNumber')
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
            .skip((page - 1) * parseInt(limit))
            .limit(parseInt(limit));
        console.log(logs)
        // Step 2: Extract userIds of all shopOwners from fetched logs
        const userIds = logs
            .map(log => log.shopOwner?._id?.toString())
            .filter(id => id); // Remove undefined/null values

        // Step 3: Fetch corresponding shopOwnerId from ShopOwner model
        const shopOwners = await ShopOwner.find({ userId: { $in: userIds } }, 'userId shopOwnerId');

        // Step 4: Create a mapping of userId -> shopOwnerId
        const shopOwnerMap = {};
        shopOwners.forEach(owner => {
            shopOwnerMap[owner.userId.toString()] = owner.shopOwnerId;
        });

        // Step 5: Format logs and include shopOwnerId
        const formattedLogs = logs.map(log => ({
            _id: log._id,
            actionType: log.actionType,
            shopOwnerId: shopOwnerMap[log.shopOwner?._id?.toString()] || 'N/A', // Fetch from mapping
            shopOwnerName: log.shopOwner ? `${log.shopOwner.firstName} ${log.shopOwner.lastName}` : 'N/A',
            phoneCheckerName: log.phoneChecker ? `${log.phoneChecker.firstName} ${log.phoneChecker.lastName}` : 'N/A',
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

