import mongoose, { SchemaTypeOptions } from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    batchNo: {
      type: String,
      required: true,
      min: 5,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    description: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Both"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Active", "Completed", "Cancelled"],
      default: "Pending",
    },
    createdBy: {
      type: String,
      default: null,
    },

    updates: [
      {
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { updatedBy: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Batch = mongoose.model("Batch", batchSchema);

export default Batch;
