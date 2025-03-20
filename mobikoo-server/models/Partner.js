const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    website: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Partner', PartnerSchema);
