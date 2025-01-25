import express from "express";
import Joi from "joi";
import UserQuiz from "../models/UserQuiz.model.js"; // Assuming the UserQuiz model is in the models folder
import sendResponse from "../helpers/sendResponse.js"; // Assuming sendResponse is a helper function to structure the responses

const router = express.Router();

const userQuizValidationSchema = Joi.object({
  user: Joi.string().required().messages({
    "any.required": "User ID is required.",
    "string.empty": "User ID cannot be empty.",
  }),
  quizzes: Joi.array()
    .items(
      Joi.object({
        quiz: Joi.string().required().messages({
          "any.required": "Quiz ID is required.",
          "string.empty": "Quiz ID cannot be empty.",
        }),
        course: Joi.string().required().messages({
          "any.required": "Course ID is required.",
          "string.empty": "Course ID cannot be empty.",
        }),
        batchNo: Joi.string().required().messages({
          "any.required": "Batch ID is required.",
          "string.empty": "Batch ID cannot be empty.",
        }),
        questionsList: Joi.array()
          .items(
            Joi.object({
              question: Joi.string().required().messages({
                "any.required": "Question ID is required.",
                "string.empty": "Question ID cannot be empty.",
              }),
              userAnswer: Joi.string().required().messages({
                "any.required": "User answer is required.",
                "string.empty": "User answer cannot be empty.",
              }),
              isCorrect: Joi.boolean().default(false).messages({
                "boolean.base": "isCorrect must be a boolean value.",
              }),
            })
          )
          .min(1)
          .required()
          .messages({
            "array.base": "Questions list must be an array.",
            "array.min": "At least one question is required.",
          }),
        totalScore: Joi.number().required().messages({
          "any.required": "Total score is required.",
          "number.base": "Total score must be a number.",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Quizzes must be an array.",
      "array.min": "At least one quiz is required.",
    }),
});


router.post("/add-user-quiz", async (req, res) => {
  try {
    // Validate the request body using Joi
    const { error } = userQuizValidationSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return sendResponse(res, 400, null, true, error.details.map((detail) => detail.message).join(", "));
    }

    const { user, quizzes } = req.body; // Extract user and quizzes from validated data

    // Fetch the user's existing quiz data
    let userQuiz = await UserQuiz.findOne({ user });

    if (userQuiz) {
      // Iterate over the quizzes in the request body
      for (let quizData of quizzes) {
        const { quiz, course, batchNo } = quizData;

        // Check if the user has already taken a quiz in the same course and batch
        const existingQuizInBatch = userQuiz.quizzes.find(
          (quizItem) => quizItem.course.toString() === course && quizItem.batchNo.toString() === batchNo
        );

        if (existingQuizInBatch) {
          // If the quiz already exists in the same course and batch, add the new quiz without overriding
          existingQuizInBatch.questionsList.push(...quizData.questionsList);
          existingQuizInBatch.totalScore += quizData.totalScore; // Adding the score if needed
        } else {
          // If the quiz is from a new course or batch, add it as a new entry
          userQuiz.quizzes.push(quizData);
        }
      }

      // Save the updated user quiz data
      await userQuiz.save();
      sendResponse(res, 200, userQuiz, false, "User quiz updated successfully");
    } else {
      // If user has no quiz entry, create a new one
      const newUserQuiz = new UserQuiz({ user, quizzes });
      await newUserQuiz.save();
      sendResponse(res, 201, newUserQuiz, false, "User quiz added successfully");
    }
  } catch (error) {
    console.error("Error adding/updating user quiz:", error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});


// Get all quizzes for a specific user by userId
const userIdValidationSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required.",
    "string.empty": "User ID cannot be empty.",
  }),
});

// Use it in the route
router.get("/user-quizzes/:userId", async (req, res) => {
  const { error } = userIdValidationSchema.validate(req.params);
  if (error) {
    return sendResponse(res, 400, null, true, error.details[0].message);
  }
  try {
    const { userId } = req.params;

    // Fetch user quiz details and populate the quiz data (e.g., totalQuestions from Quiz model)
    const userQuiz = await UserQuiz.findOne({ userId }).populate("quizzes.quizId totalQuestions");

    if (!userQuiz) {
      return sendResponse(res, 404, null, true, "User quiz not found");
    }

    sendResponse(res, 200, userQuiz, false, "User quizzes fetched successfully");
  } catch (error) {
    console.error("Error fetching user quizzes:", error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Get quizzes by quizId
router.get("/user-quiz/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;

    // Fetch all users who attempted a specific quiz
    const userQuizzes = await UserQuiz.find({ "quizzes.quizId": quizId }).populate(
      "userId quizzes.quizId totalQuestions"
    );

    if (!userQuizzes || userQuizzes.length === 0) {
      return sendResponse(res, 404, null, true, "No users found for this quiz");
    }

    sendResponse(res, 200, userQuizzes, false, "User quizzes for the quiz fetched successfully");
  } catch (error) {
    console.error("Error fetching user quizzes for quiz:", error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Delete user quiz by userId
router.delete("/delete-user-quiz/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userQuiz = await UserQuiz.findOneAndDelete({ userId });

    if (!userQuiz) {
      return sendResponse(res, 404, null, true, "User quiz not found");
    }

    sendResponse(res, 200, userQuiz, false, "User quiz deleted successfully");
  } catch (error) {
    console.error("Error deleting user quiz:", error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

export default router;
