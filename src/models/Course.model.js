import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
    },
    fees: {
      type: Number,
      min: 0,
      default: 0,
    },
    eligibility: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      default: null,
    },
    updates: [
      {
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: String, default: null },
        reason: { type: String, default: null },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
