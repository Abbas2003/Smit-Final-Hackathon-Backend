import express from "express";
import Joi from "joi";
import Quiz from "../models/Quiz.model.js";
import sendResponse from "../helpers/sendResponse.js";

const router = express.Router();

const quizschema = Joi.object({
  title: Joi.string().required().messages({
    "string.empty": "Title is required.",
  }),
  description: Joi.string().allow("").messages({
    "string.base": "Description must be a string.",
  }),
  course: Joi.string().required().messages({
    "string.empty": "Course ID is required.",
  }),
  batchNo: Joi.string().required().messages({
    "string.empty": "Batch ID is required.",
  }),
  questionsList: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().required().messages({
          "string.empty": "Question is required.",
        }),
        options: Joi.array()
          .items(
            Joi.string().required().messages({
              "string.empty": "Option cannot be empty.",
            })
          )
          .min(2)
          .required()
          .messages({
            "array.base": "Options must be an array.",
            "array.min": "At least 2 options are required.",
          }),
        answer: Joi.string().required().messages({
          "string.empty": "Answer is required.",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "QuestionsList must be an array.",
      "array.min": "At least 1 question is required.",
    }),
  totalMarks: Joi.number().required().messages({
    "number.base": "Total marks must be a number.",
    "any.required": "Total marks are required.",
  }),
  status: Joi.string().valid("inactive", "active", "completed").default("inactive").messages({
    "any.only": "Status must be one of: inactive, active, or completed.",
  }),
});

// Get all quizzes
router.get("/all-quizzes", async (req, res) => {
  const { error } = quizschema.validate(req.body); // Validate input
  if (error) {
    const errors = error.details.map((detail) => detail.message).join(", ");
    return sendResponse(res, 400, null, true, errors);
  }

  try {
    const quizzes = await Quiz.aggregate([
      {
        $lookup: {
          from: "courses", // The collection name for the `Course` model
          localField: "course", // Field in Quiz schema
          foreignField: "_id", // Field in Course schema
          as: "course", // Output array field
        },
      },
      {
        $lookup: {
          from: "batches", // The collection name for the `Batch` model
          localField: "batchNo", // Field in Quiz schema
          foreignField: "_id", // Field in Batch schema
          as: "batchNo", // Output array field
        },
      },
      {
        $unwind: "$course", // Optional: If you want to treat course as a single object instead of an array
      },
      {
        $unwind: "$batchNo", // Optional: If you want to treat batch as a single object instead of an array
      },
      {
        $project: {
          "course.title": 1, // Include specific fields from the course
          "batchNo.batchNo": 1, // Include specific fields from the batch
        },
      },
    ]);

    sendResponse(res, 200, quizzes, false, "Quizzes fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Get a single quiz by ID
router.get("/single-quiz/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id).populate("courseId").populate("batchNo"); // Fetch a quiz by ID with populated details
    if (!quiz) return sendResponse(res, 404, null, true, "Quiz not found");
    sendResponse(res, 200, quiz, false, "Quiz fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Add a new quiz
router.post("/add-quiz", async (req, res) => {
  try {
    const { error } = quizschema.validate(req.body);
    if (error) {
      const errors = error.details.map((detail) => detail.message).join(", ");
      return sendResponse(res, 400, null, true, errors);
    }
    const quiz = new Quiz(req.body); // Create a new quiz
    await quiz.save(); // Save the quiz

    sendResponse(res, 201, quiz, false, "Quiz added successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Update quiz details
router.put("/update-quiz/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quizId, courseId, batchNo, totalQuestions } = req.body; // Extract quiz details

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      { quizId, courseId, batchNo, totalQuestions },
      { new: true } // Return the updated document
    );

    if (!updatedQuiz) {
      return sendResponse(res, 404, null, true, "Quiz not found");
    }

    sendResponse(res, 200, updatedQuiz, false, "Quiz updated successfully");
  } catch (error) {
    console.error("Error updating quiz:", error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Delete a quiz by ID
router.delete("/delete-quiz/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findByIdAndDelete(id); // Delete quiz by ID

    if (!quiz) {
      return sendResponse(res, 404, null, true, "Quiz not found");
    }

    sendResponse(res, 200, quiz, false, "Quiz deleted successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

export default router;
