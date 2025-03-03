const mongoose = require('mongoose');

const phoneCheckerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    phoneNumber: { type: String, required: true },
    area: { type: String, required: true }
});

const PhoneChecker = mongoose.model('PhoneChecker', phoneCheckerSchema);

module.exports = PhoneChecker; 