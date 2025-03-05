const mongoose = require('mongoose');

const inspectionRequestSchema = new mongoose.Schema({
    shopOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopOwner', required: true },
    inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['accepted', 'rejected', 'pending', 'completed'], required: true },
    createdAt: { type: Date, default: Date.now }
});

const InspectionRequest = mongoose.model('InspectionRequest', inspectionRequestSchema);

module.exports = InspectionRequest;
