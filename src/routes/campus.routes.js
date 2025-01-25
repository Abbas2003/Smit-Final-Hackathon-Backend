import express from "express";
import Joi from "joi";
import Campus from "../models/Campus.model.js";
import sendResponse from "../helpers/sendResponse.js";
import City from "../models/City.model.js";
// import { authorizationAdmin } from "../middlewares/authorization.js";

const router = express.Router();

const campusSchema = Joi.object({
  title: Joi.string().trim().min(5).max(20).required(),
  address: Joi.string().trim().min(10).max(200).required(),
  city: Joi.string().trim().required(),
  contact: Joi.string()
    .trim()
    .min(11)
    .regex(/^\d{11}$/)
    .required(),
  email: Joi.string().trim().email().required(),
  updates: Joi.array()
    .items(
      Joi.object({
        updatedAt: Joi.date().iso().required(),
        updatedBy: Joi.string().optional(),
      })
    )
    .optional(),
});

router.get("/all-campuses", async (req, res) => {
  try {
    const campuses = await Campus.find().populate("city"); // Populating the city reference

    sendResponse(res, 200, campuses, false, "Campuses and locations fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.get("/single-campus/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const campus = await Campus.findById(id);
    if (!campus) return sendResponse(res, 404, null, true, "Campus not found");
    sendResponse(res, 200, campus, false, "Campus fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.post("/add-campus", async (req, res) => {
  try {
    const { error } = campusSchema.validate(req.body);
    if (error) {
      const errors = error.details.map((detail) => detail.message).join(", ");
      return sendResponse(res, 400, null, true, errors);
    }

    const campus = new Campus(req.body);
    console.log("campus=>>>", campus)
    await campus.save();

    sendResponse(res, 201, campus, false, "Campus added successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.put("/update-campus/:id", async (req, res) => {
  try {
    const { updatedBy, ...updatedCampusDetails } = req.body;
    console.log("updatedCampusDetails=>", updatedCampusDetails)
    if (!updatedCampusDetails.city) {
      return sendResponse(res, 400, null, true, "City is required");
    }
    const campus = await Campus.findByIdAndUpdate(req.params.id, { $set: updatedCampusDetails }, { new: true });
    if (!campus) {
      return res.status(404).send({ error: true, message: "Campus not found" });
    }
    const updatedCampus = await Campus.findByIdAndUpdate(
      req.params.id,
      { $push: { updates: { updatedAt: new Date(), updatedBy, reason: "Campus updated" } } },
      { new: true }
    );
    res.status(200).send({ data: updatedCampus, message: "Campus updated successfully" });
  } catch (error) {
    console.error("Error updating campus:", error);
    res.status(500).send({ error: true, message: "Internal server error", data: null });
  }
});

router.delete("/delete-campus/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const campus = await Campus.findByIdAndDelete(id);

    if (!campus) {
      return sendResponse(res, 404, null, true, "Campus not found");
    }

    sendResponse(res, 200, campus, false, "Campus deleted successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

router.get("/campus-count", async (req, res) => {
  try {
    const campusCount = await Campus.countDocuments(); // Get the total number of campuses
    sendResponse(res, 200, { campusCount }, false, "Campus count fetched successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

export default router;
