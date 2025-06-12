const mongoose = require('mongoose');

const directWarrantiesSchema = mongoose.Schema({

    paymentOrderId: {
        type: String,
        // required: true
    },
    deviceDetails: {
        deviceName: {
            type: String,
            required: true
        },
        purchaseDate: {
            type: String,
            required: true
        },
        devicePrice: {
            type: String,
            required: true
        }
    },
    customerDetails: {
        customerName: {
            type: String,
            required: true
        },
        customerEmail: {
            type: String,
            required: true
        },
        customerPhone: {
            type: String,
            required: true
        }
    },
    planDetails: {
        planType: {
            type: String,
            required: true
        },
        planPrice: {
            type: String,
            required: true
        }
    }

})

const DirectWarranties = mongoose.model('DirectWarranties', directWarrantiesSchema);

module.exports = DirectWarranties;