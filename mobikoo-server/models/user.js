const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {   
    type: String, 
    enum: ["admin", "shop-owner", "customer", "phone-checker"], 
    required: true 
  },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
