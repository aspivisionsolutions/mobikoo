const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    IMEI: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    Brand: {
        type: String,
        required: true,
        trim: true
    },
    Model: {
        type: String,
        required: true,
        trim: true
    },
    OwnerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the timestamp when document is modified
deviceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Device = mongoose.model('devices', deviceSchema);

module.exports = Device;
