const mongoose = require('mongoose');

const inspectionRequestSchema = new mongoose.Schema({
    shopOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopOwner', required: true },
    inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['completed', 'pending'], required: true }
});

const InspectionRequest = mongoose.model('InspectionRequest', inspectionRequestSchema);

module.exports = InspectionRequest;
