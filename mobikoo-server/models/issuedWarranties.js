const mongoose = require('mongoose');

const issuedWarrantiesSchema = mongoose.Schema({
    inspectionReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InspectionReport',
        required: true
    },
    warrantyPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WarrantyPlan',
        required: true
    },
    razorpayPaymentId: { 
        type: String 
    },
    issueDate: {
        type: Date
    },
    phoneChecker: { type: mongoose.Schema.Types.ObjectId, ref: 'PhoneChecker', required: true },  
    claimStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, 
})

const IssuedWarranties = mongoose.model('IssuedWarranties', issuedWarrantiesSchema);

module.exports = IssuedWarranties;