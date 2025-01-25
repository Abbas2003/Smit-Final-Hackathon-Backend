import express from "express";
import Joi from "joi";
import mongoose from "mongoose";
import sendResponse from "../helpers/sendResponse.js";
import Batch from "../models/Batch.model.js";
import Course from "../models/Course.model.js";
import City from "../models/City.model.js";

const router = express.Router();

const batchSchema = Joi.object({
  batchNo: Joi.string().min(5).max(10).required(),
  course: Joi.string().required(),
  description: Joi.string().optional(),
  startDate: Joi.date().required(),
  city: Joi.string().required(),
  gender: Joi.string().valid("Male", "Female", "Both").required(),
  status: Joi.string().valid("Pending", "Active", "Completed", "Cancelled").default("Pending"),
});

// Fetch all batches
router.get("/all-batches", async (req, res) => {
  try {
    const response = await Batch.find().populate("course").populate("city");
    sendResponse(res, 200, response, false, "Batches fetched successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Fetch a single batch by ID
router.get("/single-batch/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findById(id).populate("course").populate("city");
    if (!batch) {
      return sendResponse(res, 404, null, true, "Batch not found");
    }
    sendResponse(res, 200, batch, false, "Batch fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Add a new batch
router.post("/add-batch", async (req, res) => {
  try {
    const { error } = batchSchema.validate(req.body);
    if (error) {
      const errors = error.details.map((detail) => detail.message).join(", ");
      return sendResponse(res, 400, null, true, errors);
    }
    const { course, city } = req.body;
    const courseDoc = await Course.findById(course);
    const cityDoc = await City.findById(city);

    if (!courseDoc || !cityDoc) {
      return sendResponse(res, 400, null, true, "Invalid course or city");
    }
    const batch = new Batch({
      ...req.body,
      course: courseDoc._id,
      city: cityDoc._id,
    });

    await batch.save();
    sendResponse(res, 201, batch, false, "Batch added successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});


// Update an existing batch
router.put("/update-batch/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the ID is valid
    if (!mongoose.isValidObjectId(id)) {
      return sendResponse(res, 400, null, true, "Invalid batch ID format");
    }

    // Validate request body using the schema
    const { error } = batchSchema.validate(req.body);
    if (error) {
      return sendResponse(res, 400, null, true, error.details[0].message);
    }

    const { course, city, ...updateData } = req.body;

    // Validate and update course and city fields
    if (course) {
      const courseDoc = await Course.findById(course);
      if (!courseDoc) {
        return sendResponse(res, 400, null, true, "Invalid course ID");
      }
      updateData.course = courseDoc._id;
    }

    if (city) {
      const cityDoc = await City.findById(city);
      if (!cityDoc) {
        return sendResponse(res, 400, null, true, "Invalid city ID");
      }
      updateData.city = cityDoc._id;
    }

    // Manually push the update into the `updates` array
    const batch = await Batch.findByIdAndUpdate(
      id,
      {
        ...updateData,
        $push: { updates: { updatedAt: Date.now(), updatedBy: "admin" } }, // Example: Update who updated the batch
      },
      { new: true }
    )
      .populate("course")
      .populate("city");

    if (!batch) {
      return sendResponse(res, 404, null, true, "Batch not found");
    }

    sendResponse(res, 200, batch, false, "Batch updated successfully");
  } catch (error) {
    console.error("Error updating batch:", error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Delete batch by ID
router.delete("/delete-batch/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendResponse(res, 400, null, true, "Invalid batch ID format");
    }

    const batch = await Batch.findByIdAndDelete(id);

    if (!batch) {
      return sendResponse(res, 404, null, true, "Batch not found");
    }

    sendResponse(res, 200, batch, false, "Batch deleted successfully");
  } catch (error) {
    console.log(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

export default router;
