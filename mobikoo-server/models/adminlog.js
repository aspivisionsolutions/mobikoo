const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
    phoneChecker: { type: mongoose.Schema.Types.ObjectId, ref: 'PhoneChecker', required: true },
    shopOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopOwner', required: true },
    phoneDetails: {
        model: { type: String, required: true },
        imeiNumber: { type: String, required: true }
    },
    warrantyDetails: {
        planName: { type: String, required: true },
        price: { type: Number, required: true }
    },
    invoiceDetails: {
        invoiceId: { type: String },
        buyerDetails: {
            name: { type: String },
            email: { type: String }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Adminlog', adminLogSchema);
