const mongoose = require('mongoose');

const shopDetailsSchema = new mongoose.Schema({
    shopName: { type: String, required: true },
    address: { type: String, required: true }
});

const ShopDetails = mongoose.model('ShopDetail', shopDetailsSchema);

module.exports = ShopDetails; 