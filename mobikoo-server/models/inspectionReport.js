const mongoose = require('mongoose');

const inspectionReportSchema = new mongoose.Schema({
    shopName: { type: String, required: true },
    inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    inspectionDate: { type: Date, required: true},
    imeiNumber: { type: String, required: true,unique:true },
    deviceModel: { type: String, required: true },
    serialNumber: { type: String, required: true },
    operatingSystem: { type: String, required: true },
    screenCondition: { type: String, required: true },
    bodyCondition: { type: String, required: true },
    batteryHealth: { type: String, required: true },
    chargingPortFunctionality: { type: String, required: true },
    cameraFunctionality: { type: String, required: true },
    buttonsSensors: { type: String, required: true },
    osFunctionality: { type: String, required: true },
    performanceBenchmark: { type: String, required: true },
    photos: { type: [String]},
    comments: { type: String, required: true },
    digitalSignature: { type: Boolean, required: true },
    grade: { type: String, required: true },
    fineStatus:{type:String,default:"Not-Fined",enum:["Fined","Not-Fined"]},
    warrantyStatus:{type:String,default:"not-purchased",enum:["not-purchased","purchased","processing","activated"]},
    warrantyDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IssuedWarranties'
    }
});

const InspectionReport = mongoose.model('InspectionReport', inspectionReportSchema);

module.exports = InspectionReport;
