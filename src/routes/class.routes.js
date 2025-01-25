import express from "express";
import Joi from "joi";
import Class from "../models/Class.model.js";  
import sendResponse from "../helpers/sendResponse.js";

const router = express.Router();

const classValidationSchema = Joi.object({
  classTitle: Joi.string().trim().min(3).max(100).required(),
  classType: Joi.string().valid("Auditorium", "Computer_Lab").required(),
  capacity: Joi.number().required(),
  campus: Joi.string().required(),  
  city: Joi.string().required(),   
  createdBy: Joi.string().optional(),
  updates: Joi.array()
    .items(
      Joi.object({
        updatedAt: Joi.date().iso().required(),
        updatedBy: Joi.string().optional(),
      })
    )
    .optional(),
});

router.get("/all-classes", async (req, res) => {
  try {
    const classes = await Class.find().populate("city campus"); 

    sendResponse(res, 200, classes, false, "Classes and locations fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.get("/single-class/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const classData = await Class.findById(id).populate("city campus"); // Populating city and campus

    if (!classData) {
      return sendResponse(res, 404, null, true, "Class not found");
    }
    sendResponse(res, 200, classData, false, "Class fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.post("/add-class", async (req, res) => {
  try {
    const { error } = classValidationSchema.validate(req.body);
    if (error) {
      const errors = error.details.map((detail) => detail.message).join(", ");
      return sendResponse(res, 400, null, true, errors);
    }
    const classData = new Class(req.body);
    console.log("req.body=>", classData)
    await classData.save();

    sendResponse(res, 201, classData, false, "Class added successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.put("/update-class/:id", async (req, res) => {
  try {
    const { updatedBy, ...updatedClassDetails } = req.body;

    if (!updatedClassDetails.city || !updatedClassDetails.campus) {
      return sendResponse(res, 400, null, true, "City and Campus are required");
    }

    const classData = await Class.findByIdAndUpdate(req.params.id, { $set: updatedClassDetails }, { new: true });

    if (!classData) {
      return sendResponse(res, 404, null, true, "Class not found");
    }

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { $push: { updates: { updatedAt: new Date(), updatedBy, reason: "Class updated" } } },
      { new: true }
    );

    sendResponse(res, 200, updatedClass, false, "Class updated successfully");
  } catch (error) {
    console.error("Error updating class:", error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.delete("/delete-class/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const classData = await Class.findByIdAndDelete(id);

    if (!classData) {
      return sendResponse(res, 404, null, true, "Class not found");
    }

    sendResponse(res, 200, classData, false, "Class deleted successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.get("/class-count", async (req, res) => {
  try {
    const classCount = await Class.countDocuments(); // Get the total number of classes
    sendResponse(res, 200, { classCount }, false, "Class count fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

export default router;
