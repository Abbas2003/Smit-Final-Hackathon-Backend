import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    batchNo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    // Bulk upload
    questionsList: [
      {
        question: { type: String, required: true },
        options: { type: [String], required: true },
        answer: { type: String, required: true },
      },
    ],
    totalMarks: { type: Number, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["inactive", "active", "completed"],
      default: "inactive",
    },
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
