import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  days: {
    type: [String],
    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City"
  },
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campus"
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class"
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },
  batchNo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch"
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  createdBy: {
    type: String,
    default: null
  },
  updates: [
    {
      updatedAt: { type: Date, default: Date.now },
      updatedBy: { type: String, default: null }
    }
  ]
}, {
  timestamps: true
});

const Section = mongoose.model("Section", sectionSchema);

export default Section;
