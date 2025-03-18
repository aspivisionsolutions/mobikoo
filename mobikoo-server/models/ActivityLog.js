const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    actionType: { 
        type: String, 
        enum: ['Warranty Purchased', 'New Claim', 'Inspection Report', 'Warranty Activated'], 
        required: true 
    },
    shopOwner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ShopOwner', 
    },
    phoneChecker: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'PhoneChecker' 
    },
    customer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Customer', 
    },
    phoneDetails: {
        model: { type: String, required: true },
        imeiNumber: { type: String, required: true }
    },
    warrantyDetails: {
        planName: { type: String, required: true },
        price: { type: Number, required: true },
        claimStatus: { type: String, enum: ['Submitted'] } // Tracks claim progress
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
