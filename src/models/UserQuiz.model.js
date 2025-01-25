import mongoose from "mongoose";

const userQuizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },

    quizzes: [
      {
        quiz: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quiz", 
          required: true,
        },
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
        questionsList: [
          {
            question: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Quiz", 
              required: true,
            },
            userAnswer: {
              type: String,
              required: true,
            },
            isCorrect: {
              type: Boolean, 
              default: false,
            },
          },
        ],
        totalScore: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true, 
  }
);

const UserQuiz = mongoose.model("UserQuiz", userQuizSchema);

export default UserQuiz;
