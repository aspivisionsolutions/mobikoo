const mongoose = require("mongoose")
const { ref } = require("pdfkit")

const fineSchema = new mongoose.Schema({
    inspectorId:{type: mongoose.Schema.Types.ObjectId, ref:"User", required:true},
    inspectionId:{type:mongoose.Schema.Types.ObjectId, ref:"InspectionReport",required:true,unique:true},
    fineAmount:{type:Number,required:true},
    comment:{type:String,required:true}
})

const Fine = mongoose.model("fine",fineSchema)
module.exports = Fine