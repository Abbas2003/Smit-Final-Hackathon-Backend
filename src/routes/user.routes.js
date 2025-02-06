import "dotenv/config";
import express from "express";
import nodemailer from "nodemailer";
import User from "../models/User.model.js";
import sendResponse from "../helpers/sendResponse.js";
import { authorizationUser } from "../middlewares/authorization.js";
import { upload, uploadToCloudinary } from "../components/imageuploader.js";

const router = express.Router();

router.get("/get-my-info", authorizationUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return sendResponse(res, 404, null, true, "User not found");
    sendResponse(res, 200, user, false, "User fetched successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
})

router.post("/send-email", async (req, res) => {

  try {
    const { senderName, sender, receiver, subject, message } = req.body;
    // console.log("req body in backend send email", req.body)

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.GMAIL_PASS,
      },
    });
    const sendEmail = async (
      senderName,
      sender,
      receiver,
      subject,
      message
    ) => {
      try {
        const info = await transporter.sendMail({
          from: `${senderName} 👻" <${sender}>`,
          to: receiver, // list of receivers
          subject: subject, // Subject line
          text: message, // plain text body
          html: message, // html body
        });
        console.log("Message sent: %s", info.messageId);
      } catch (error) {
        console.log(error);
      }
    };
    await sendEmail(
      senderName,
      sender,
      receiver,
      subject,
      message
    );
    res.status(200).json({ error: false, message: "Email sent successfully" });
  } catch (error) {
    console.log(error);
  }

})

// Update user route
router.put("/update-user/:id", upload.fields([{ name: "bankStatement" }, { name: "salarySheet" }]), async (req, res) => {
  try {
    const id = req.params.id;
    let user = await User.findById(id);
    if (!user) return sendResponse(res, 404, null, true, "User not found");

    let updateData = { ...req.body };

    console.log("bankStatement:", req?.files?.bankStatement);
    console.log("salarySheet:", req?.files?.salarySheet);

    // Handle file uploads
    if (req.files?.bankStatement) {
      const bankStatementUpload = await uploadToCloudinary(req.files.bankStatement[0]);
      console.log("bankStatementUpload:", bankStatementUpload);
      updateData.bankStatement = bankStatementUpload.secure_url;
    }
    if (req.files?.salarySheet) {
      const salarySheetUpload = await uploadToCloudinary(req.files.salarySheet[0]);
      console.log("salarySheetUpload:", salarySheetUpload);
      updateData.salarySheet = salarySheetUpload.secure_url;
    }

    // Update user profile in DB
    user = await User.findByIdAndUpdate(id, updateData, { new: true });

    sendResponse(res, 200, user, false, "User updated successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});




export default router;
