import express from "express";
import Joi from "joi";
import sendResponse from "../helpers/sendResponse.js";
// import { authorizationAdmin } from "../middlewares/authorization.js";
import Section from "../models/Section.model.js";
import User from "../models/User.model.js";

const router = express.Router();

const sectionSchema = Joi.object({
  days: Joi.array().items(Joi.string().valid("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")).required(),
  startTime: Joi.string().required(),
  duration: Joi.string().required(),
  city: Joi.string().required(),
  campus: Joi.string().required(),
  class: Joi.string().required(),
  course: Joi.string().required(),
  batchNo: Joi.string().required(),
  trainer: Joi.string().required(), 
  createdBy: Joi.string().allow(null).optional(),
  updates: Joi.array()
    .items(
      Joi.object({
        updatedAt: Joi.date().default(Date.now),
        updatedBy: Joi.string().allow(null).optional(),
      })
    )
    .optional(),
});

// Get all sections route
router.get("/all-sections", async (req, res) => {
    try {
      const sections = await Section.find().populate("city campus class course");
      sendResponse(res, 200, sections, false, "Sections fetched successfully");
    } catch (error) {
      console.error(error.message);
      sendResponse(res, 500, null, true, error.message);
    }
  });
  
  // Get single section route
  router.get("/single-section/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const section = await Section.findById(id).populate("city campus class course ");
  
      if (!section) return sendResponse(res, 404, null, true, "Section not found");
  
      sendResponse(res, 200, section, false, "Section fetched successfully");
    } catch (error) {
      console.error(error.message);
      sendResponse(res, 500, null, true, "Internal server error");
    }
  });
      // const trainer = await User.findById(req.body);
    // if (!trainer) return sendResponse(res, 400, null, true, "Trainer not found");
    // if (trainer.role !== "trainer") return sendResponse(res, 400, null, true, "Assigned user is not a trainer");


// Add section route with authorizationAdmin middleware
router.post("/add-section", async (req, res) => {
  try {
    const { error } = sectionSchema.validate(req.body);
    if (error) return sendResponse(res, 400, null, true, error.details[0].message);
      console.log("req.body", req.body)

    const existingSection = await Section.findOne({
      class: req.body.class,
      days: req.body.days,
      course: req.body.course,
      batchNo: req.body.batchNo,
      trainer: req.body.trainer,
      startTime: req.body.startTime,
      
    });
    if (existingSection)
      return sendResponse(res, 400, null, true, "Section with the same course, batch, and trainer already exists");

    const section = new Section(req.body);
    await section.save();
    sendResponse(res, 201, section, false, "Section added successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Update section route with authorizationAdmin middleware
router.put("/update-section/:id", async (req, res) => {
  try {
    const { error } = sectionSchema.validate(req.body);

    if (error) return sendResponse(res, 400, null, true, error.details[0].message);

    const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!section) return sendResponse(res, 404, null, true, "Section not found");
    sendResponse(res, 200, section, false, "Section updated successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, error.message);
  }
});

// Delete section route with authorizationAdmin middleware
router.delete("/delete-section/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const section = await Section.findByIdAndDelete(id);
    if (!section) return sendResponse(res, 404, null, true, "Section not found");

    sendResponse(res, 200, section, false, "Section deleted successfully");
  } catch (error) {
    console.log(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

export default router;
