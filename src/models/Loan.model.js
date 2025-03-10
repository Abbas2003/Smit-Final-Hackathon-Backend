import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true }, 
  subcategory: { type: String, required: true }, 
  amount: { type: Number, required: true },
  loanPeriod: { type: Number, required: true },
  initialDeposit: { type: Number },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
}, { timestamps: true });

const Loan = mongoose.model("Loan", loanSchema);
export default Loan;