import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: "Loan", required: true },
  tokenNumber: { type: String, unique: true, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  officeLocation: { type: String, required: true },
  qrCode: { type: String },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
}, { timestamps: true });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;