import express from "express";
import Joi from "joi";
import Course from "../models/Course.model.js";
import sendResponse from "../helpers/sendResponse.js";
// import { authorizationAdmin } from "../middlewares/authorization.js";

const router = express.Router();

const courseSchema = Joi.object({
  courseCode: Joi.string().trim().min(2).max(10).required(),
  title: Joi.string().trim().min(3).max(50).required(),
  description: Joi.string().trim().required(),
  duration: Joi.string().trim().required(),
  fees: Joi.number().min(0),
  eligibility: Joi.string().trim(),
  isActive: Joi.boolean(),
  updates: Joi.array()
    .items(
      Joi.object({
        updatedAt: Joi.date().iso().required(),
      })
    )
    .optional(),
});

router.get("/all-courses", async (req, res) => {
  try {
    const courses = await Course.find();
    sendResponse(res, 200, courses, false, "Courses fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Correcting the route to handle dynamic courseId in URL
router.get("/single-course/:id", async (req, res) => {
  try {
    const { id } = req.params; // Access the dynamic id from the URL parameters

    // Fetch the course using the id
    const course = await Course.findById(id);

    if (!course) {
      return sendResponse(res, 404, null, true, "Course not found");
    }

    sendResponse(res, 200, course, false, "Course fetched successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});





router.post("/add-course", async (req, res) => {
  try {
    const { error } = courseSchema.validate(req.body);
    if (error) {
      const errors = error.details.map((detail) => detail.message).join(", ");
      return sendResponse(res, 400, null, true, errors);
    }
    const course = new Course(req.body);
    await course.save();
    sendResponse(res, 201, course, false, "Course added successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.put("/update-course/:id", async (req, res) => {
  try {
    const { updatedBy, ...updatedCourseDetails } = req.body;

    // Step 1: Update non-array fields
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updatedCourseDetails }, // Update other fields (title, description, etc.)
      { new: true }
    );

    if (!course) {
      return sendResponse(res, 404, null, true, "Course not found");
    }

    // Step 2: Add new update to the `updates` array
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $push: { updates: { updatedAt: new Date(), updatedBy } } }, // Push to updates array
      { new: true }
    );

    sendResponse(res, 200, updatedCourse, false, "Course updated successfully");
  } catch (error) {
    console.error("Error updating course:", error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.delete("/delete-course/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return sendResponse(res, 404, null, true, "Course not found");
    }

    sendResponse(res, 200, course, false, "Course deleted successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});


router.get("/course-count", async (req, res) => {
  try {
    const courseCount = await Course.countDocuments(); // Get the total number of courses
    sendResponse(res, 200, { courseCount }, false, "Course count fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

export default router;
