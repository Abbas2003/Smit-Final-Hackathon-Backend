import express from "express";
import sendResponse from "../helpers/sendResponse.js";
import "dotenv/config";
import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { authorizationAdmin, authorizationUser } from "../middlewares/authorization.js";
import { upload, uploadToCloudinary } from "../components/imageuploader.js";
import Batch from "../models/Batch.model.js";

const router = express.Router();

// =======================New User Only====================================

const UserValidationSchema = Joi.object({
  fullName: Joi.string().trim().required(),
  fatherName: Joi.string().trim().required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .trim()
    .optional(),
  mobileNo: Joi.string()
    .pattern(/^03[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile number must start with '03' and contain 11 digits.",
    }),
  cnic: Joi.string()
    .pattern(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/)
    .optional()
    .messages({
      "string.pattern.base": "CNIC must be a 13-digit number format 00000-0000000-0.",
    }),
  dob: Joi.date().iso().required(),
  gender: Joi.string().valid("Male", "Female").required(),
  education: Joi.string().required(),
  address: Joi.string().trim().required(),
  batchNo: Joi.string().required(),
  rollNo: Joi.string().optional(),
  city: Joi.string().required(),
  course: Joi.string().required(),
  haveLaptop: Joi.string().required(),
  proficiency: Joi.string().valid("None", "Beginner", "Intermediate", "Advanced").required(),
  role: Joi.array().items(Joi.string().valid("user", "student", "admin", "trainer", "staff")).default(["user"]),
  password: Joi.string()
    .min(8)
    .when("role", {
      is: Joi.valid("student", "admin", "trainer"),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "string.min": "Password must be at least 8 characters long.",
      "any.required": "Password is required for student, admin, or trainer roles.",
    }),
  imageUrl: Joi.string().optional(),
});

router.post("/smit-registration", upload.single("imageUrl"), async (req, res) => {
  let {
    fullName,
    fatherName,
    password,
    batchNo,
    email,
    mobileNo,
    cnic,
    dob,
    gender,
    education,
    address,
    city,
    course,
    proficiency,
    role,
    haveLaptop,
  } = req.body;

  console.log("Request Body:", req.body); // Log the request body to check incoming data

  const { error } = UserValidationSchema.validate(req.body);
  if (error) {
    return sendResponse(res, 400, null, true, error.details[0].message);
  }

  try {
    let existingUser = await User.findOne({
      $or: [{ email }, { mobileNo }, { cnic }],
    });
    if (existingUser) {
      return sendResponse(res, 400, null, true, "User already exists with this email, mobile number, or CNIC.");
    }

    if (req.file) {
      console.log("File uploaded:", req.file);
    } else {
      console.log("No file received");
    }

    let imageUrl;
    if (req.file) {
      try {
        // Check file size and type manually before uploading to Cloudinary
        if (req.file.size > 1 * 1024 * 1024) {
          return sendResponse(res, 400, null, true, "File size exceeds the limit of 1MB.");
        }

        const allowedFormats = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedFormats.includes(req.file.mimetype)) {
          return sendResponse(res, 400, null, true, "Only .jpeg, .jpg, and .png formats are allowed.");
        }

        // Proceed to upload the file to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file);
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError);
        return sendResponse(res, 500, null, true, "Error uploading image");
      }
    }

    // Start roll number generation logic
    let rollNo;
    try {
      console.log("Starting roll number generation...");

      // Fetch the last user in the specified batch
      const lastUser = await User.find({ batchNo: batchNo }).sort({ rollNo: -1 }).limit(1).lean();
      console.log("Last user in batch:", lastUser);

      // Find the batch by its _id
      let findBatch = await Batch.findOne({ _id: batchNo });
      console.log("Batch details:", findBatch);

      // If the batch is not found, return an error
      if (!findBatch) {
        console.error("Batch not found for batchNo:", batchNo);
        return sendResponse(res, 404, null, true, "Batch not found");
      }

      // Extract batch title
      const batchTitle = findBatch.batchNo;
      console.log("Batch title extracted:", batchTitle);

      // Default roll number
      if (lastUser.length > 0) {
        const lastRollNo = lastUser[0].rollNo;
        if (lastRollNo) {
          // Extract the last numeric part of rollNo
          const rollParts = lastRollNo.split("-");
          const lastNumber = rollParts.length > 2 ? parseInt(rollParts[2], 10) : NaN;
          if (!isNaN(lastNumber)) {
            rollNo = `${batchTitle}-${lastNumber + 1}`;
            console.log("Generated new roll number:", rollNo);
          } else {
            console.error("Invalid roll number format in last user:", lastRollNo);
            rollNo = `${batchTitle}-1`; // First roll number if invalid format
          }
        } else {
          console.log("Last user exists but has no roll number, generating first roll number...");
          rollNo = `${batchTitle}-1`;
        }
      } else {
        console.log("No users found in batch, generating first roll number...");
        rollNo = `${batchTitle}-1`;
      }

      console.log("Final generated roll number:", rollNo);

      // Ensure rollNo is defined before proceeding
      if (!rollNo) {
        throw new Error("rollNo is not defined");
      }
    } catch (error) {
      console.error("Error generating roll number:", error);
      return sendResponse(res, 500, null, true, "Error generating roll number");
    }

    console.log("Image uploaded to Cloudinary:", imageUrl);
    console.log("Generated roll number:", rollNo);

    // Create new user
    const newUser = new User({
      fullName,
      fatherName,
      password,
      batchNo,
      email,
      mobileNo,
      cnic,
      dob,
      gender,
      education,
      address,
      city,
      rollNo, // Ensure rollNo is included
      course,
      proficiency,
      role,
      haveLaptop,
      imageUrl,
    });

    // Save new user to the database
    const savedUser = await newUser.save();

    // Return success response
    return sendResponse(res, 201, savedUser, false, `User ${fullName} added successfully`);
  } catch (error) {
    console.error("Error saving user:", error.message);
    return sendResponse(res, 500, null, true, "Error saving user");
  }
});



// router.post("/user-login", async (req, res) => {
//   try {
//     const { error, value } = userLoginSchema.validate(req.body);
//     if (error) return sendResponse(res, 400, null, true, error.message);

//     const user = await User.findOne({ email: value.email }).lean();
//     console.log("Currnet user=>", user);

//     if (!user) return sendResponse(res, 403, null, true, "User is not registered with this email.");

//     const isPasswordValid = await bcrypt.compare(value.password, user.password);
//     if (!isPasswordValid) return sendResponse(res, 403, null, true, "Invalid Credentials");
//     let loginTime = Date.now();

//     let token = jwt.sign(user, process.env.AUTH_SECRET);

//     console.log("token=> ", token);
//     sendResponse(res, 200, { user, token }, false, "User login Successfully");
//   } catch (error) {
//     console.error(error);
//     sendResponse(res, 500, null, true, "Internal server error");
//   }
// });

// ================================================================================


router.get("/all-users", async (req, res) => {
  const { role, email, cnic } = req.query;
  const query = {};
  // if (role) query.role = role;
  if (role) query.role = { $in: role };
  if (email) query.email = email;
  if (cnic) query.cnic = cnic;
  
  try {
    const users = await User.find(query);
    // const users = await User.find().populate("city campus course batch section");
    // const users = await User.find();

    // sendResponse(res, 200, { users, totalUsers: users.length }, false, "Users fetched successfully");
    sendResponse(res, 200, users, false, "Users fetched successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});


// Get single user route
router.get("/single-user", async (req, res) => {
  try {
    const { cnic } = req.query; // Access query parameter 'cnic'

    if (!cnic) {
      return sendResponse(res, 400, null, true, "Correct rollNo required");
    }

    console.log(cnic); // Log the received cnic
    const user = await User.findOne({ cnic: cnic }); // Use the cnic query parameter

    console.log("user", user); // Log the found user
    if (!user) return sendResponse(res, 404, null, true, "User not found");

    sendResponse(res, 200, user, false, "User fetched successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Delete single user route
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) return sendResponse(res, 404, null, true, "User not found");

    await User.findByIdAndDelete(id);

    sendResponse(res, 200, user, false, "User deleted successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Update user route
router.put("/:id", async (req, res) => {
  try {
    const body = req.body;
    console.log("Body=>", body);

    const id = req.params.id;
    if (!id) return sendResponse(res, 400, null, true, "User ID is required");

    const user = await User.findByIdAndUpdate({ _id: id }, body, { new: true }).exec();
    console.log("User=>", user);

    sendResponse(res, 200, user, false, "User updated successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }
});

// Forgot password route (#Not applicable for now!)
router.post("/:id/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_RESET_PASSWORD_SECRET, {
      expiresIn: "1h",
    });

    // Save the reset token to the user document (or a separate tokens collection)
    user.resetPasswordToken = resetToken;
    await user.save();

    // Send reset password email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `Click on this link to reset your password: ${resetUrl}`;

    try {
      await sendEmail(email, "Password Reset", message);
      res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      user.resetPasswordToken = undefined; // Clear the token if email sending fails
      await user.save();
      console.error(error);
      res.status(500).json({ error: "Failed to send email" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
