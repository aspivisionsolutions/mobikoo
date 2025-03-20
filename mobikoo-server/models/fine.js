const mongoose = require("mongoose")

const fineSchema = new mongoose.Schema({
    inspectorId:{type:String, required:true},
    inspectionId:{type:String,required:true,unique:true},
    fineAmount:{type:Number,required:true},
    comment:{type:String,required:true}
})

const Fine = mongoose.model("fine",fineSchema)
module.exports = Fine