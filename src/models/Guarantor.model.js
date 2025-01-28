import mongoose from "mongoose";

const guarantorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    location: { type: String, trim: true },
    cnic: { type: String, required: true, unique: true, trim: true },
    relation: { type: String, trim: true },
  },
  { timestamps: true }
);

const Guarantor = mongoose.model("Guarantor", guarantorSchema);
export default Guarantor;
