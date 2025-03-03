const mongoose = require('mongoose');

const shopOwnerSchema = new mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' , required: true},
    phoneNumber: { type: String, required: true },
    shopDetails: {
        shopName : {type: String, required: true},
        address: {type: String, required: true}
    }
});

const ShopOwner = mongoose.model('ShopOwner', shopOwnerSchema);

module.exports = ShopOwner; 