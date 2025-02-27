const mongoose = require("mongoose");

const FineSchema = new mongoose.Schema({
  phoneCheckerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shopOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
});

module.exports = mongoose.model("Fine", FineSchema);
