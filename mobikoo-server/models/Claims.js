const mongoose = require('mongoose');

const ClaimsSchema = mongoose.Schema({
    customerDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    deviceDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InspectionReport'
    },
    warrantyDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IssuedWarranties'
    },
    shopOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShopOwner'
    },
    description: {
        type: String,
        required: true
    },
    photos: {
        type: [String]
    },
    claimAmount:{
        type:Number,
    },
    claimStatus: {
        type: String,
        enum: ['Submitted','Approved', 'Rejected'],
        default: 'Submitted'
    },
    claimSubmissionDate: {
        type: Date,
        default: Date.now
    }
});

// Export the Claims model
const Claim = mongoose.model('Claims', ClaimsSchema);
module.exports = Claim;