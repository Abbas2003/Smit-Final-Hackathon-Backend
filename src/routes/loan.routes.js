import express from "express";
import Loan from "../models/Loan.model.js";
import User from "../models/User.model.js";
import validateLoan from "../middlewares/loan.middleware.js";
import sendResponse from "../helpers/sendResponse.js";
import { authorizationAdmin, authorizationUser } from "../middlewares/authorization.js";


const router = express.Router();

router.post("/request-loan", validateLoan, async (req, res) => {
    try {
        // Create the new loan
        const newLoan = await Loan.create(req.body);

        // Update the user's loans array
        await User.findByIdAndUpdate(
            req.body.userId,
            { $push: { loans: newLoan._id } },
            { new: true }
        );

        // Populate user details in the response
        const populatedLoan = await Loan.findById(newLoan._id).populate('userId', 'fullName email');

        return sendResponse(res, 201, populatedLoan, false, "Loan application submitted successfully");
    } catch (error) {
        console.error("Error creating loan:", error.message);
        return sendResponse(res, 500, null, true, "Internal server error");
    }
});


router.get("/get-user-loans", authorizationUser, async (req, res) => {
    try {
        const loans = await Loan.find({ userId: req.user._id })
            .populate('userId', 'fullName email')

        console.log("loans=>", loans);


        return sendResponse(res, 200, loans, false, "Loans fetched successfully");
    } catch (error) {
        console.error("Error fetching loans:", error.message);
        return sendResponse(res, 500, null, true, "Internal server error");
    }
});


router.get("/get-all-loans", authorizationAdmin, async (req, res) => {
    try {
        const loans = await Loan.find().populate('userId', 'fullName email');
        return sendResponse(res, 200, loans, false, "All loans fetched successfully");
    } catch (error) {
        console.error("Error fetching loans:", error.message);
        return sendResponse(res, 500, null, true, "Internal server error");
    }
});

router.put("/update-loan-status/:id", authorizationAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const loan = await Loan.findByIdAndUpdate(req.params.id, { status }, { new: true });
        return sendResponse(res, 200, loan, false, "Loan status updated successfully");
    } catch (error) {
        console.error("Error updating loan status:", error.message);
        return sendResponse(res, 500, null, true, "Internal server error");
    }
});

export default router;