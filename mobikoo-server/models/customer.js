const mongoose = require('mongoose');

const CustomerSchema = mongoose.Schema({
    customerName: {
        type: String, 
        required: true
    },
    customerPhoneNumber: {
        type: Number,
        required: true
    },
    customerAdhaarNumber: {
        type: String,
        required: true
    },
    customerEmailId: {
        type: String
    },
    deviceModel: {
        type: String
    },
    imeiNumber: {
        type: String
    },
    grade: {
        type: String
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
    }
});

// Export the Customer model
const Customer = mongoose.model('Customer', CustomerSchema);
module.exports = Customer;