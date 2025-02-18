import express from "express";
import validateGuarantor from "../middlewares/guarantor.middleware.js";
import Guarantor from "../models/Guarantor.model.js";
import sendResponse from "../helpers/sendResponse.js";
import User from "../models/User.model.js";

const router = express.Router();

router.post("/add-guarantors", async (req, res) => {
  try {
    const guarantors = req.body;
    console.log("guarantors from frontend", guarantors);

    // Validate each guarantor using the Joi schema
    for (const guarantor of guarantors) {
      const { error } = validateGuarantor(guarantor);
      if (error) {
        return sendResponse(res, 400, null, false, `Validation failed: ${error.message}`);
      }
    }

    // Check for duplicate CNICs in the database
    const existingCNICs = await Guarantor.find({ cnic: { $in: guarantors.map((g) => g.cnic) } });
    if (existingCNICs.length > 0) {
      return sendResponse(
        res,
        400,
        null,
        false,
        `Guarantors with the following CNICs already exist: ${existingCNICs.map((g) => g.cnic).join(", ")}`
      );
    }

    // Insert all guarantors
    const newGuarantors = await Guarantor.insertMany(guarantors);
    
    // Group guarantors by userId
    const guarantorsByUser = {};
    newGuarantors.forEach(guarantor => {
      if (!guarantorsByUser[guarantor.userId]) {
        guarantorsByUser[guarantor.userId] = [];
      }
      guarantorsByUser[guarantor.userId].push(guarantor._id);
    });

    // Update each user's guarantors array
    for (const [userId, guarantorIds] of Object.entries(guarantorsByUser)) {
      await User.findByIdAndUpdate(
        userId,
        { $push: { guarantors: { $each: guarantorIds } } },
        { new: true }
      );
    }

    return sendResponse(res, 201, newGuarantors, false, "Guarantors added successfully.");
  } catch (error) {
    console.error("Error adding guarantors:", error.message);
    return sendResponse(res, 500, null, true, "Internal server error.");
  }
});


export default router;
