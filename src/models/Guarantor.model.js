const mongoose = require("mongoose");

const guarantorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  email: { type: String },
  location: { type: String },
  cnic: { type: String, required: true },
  relation: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Guarantor", guarantorSchema);
