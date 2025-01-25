import express from "express";
import Student from "../models/Student.js";
import sendResponse from "../helpers/sendResponse.js";
import { authorizationUser } from "../middlewares/authorization.js";
import "dotenv/config";
import User from "../models/User.model.js";

const router = express.Router();

router.get("/all-students", async (req, res) => {
  try {
    const users = await Student.find().populate("course").populate("city");
    sendResponse(res, 200, users, false, "Users fetched successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, null, true, "Internal server error");
  }

  if (req.query.search) {
    const searchTerm = req.query.search.toLowerCase(); // Make search case-insensitive
    console.log(searchTerm);
    const filterStudent = User.filter(
      (student) =>
        student.full_name.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        student.mobile_Number.toLowerCase().includes(searchTerm) ||
        student.cnic.toLowerCase().includes(searchTerm) ||
        student.father_cnic.toLowerCase().includes(searchTerm) ||
        student.gender.toLowerCase().includes(searchTerm) ||
        student.city.toLowerCase().includes(searchTerm) ||
        student.date_of_birth.toLowerCase().includes(searchTerm) ||
        student.computerproficiency.toLowerCase().includes(searchTerm) ||
        student.last_qualification.toLowerCase().includes(searchTerm) ||
        student.address.toLowerCase().includes(searchTerm) ||
        student.roll_number == req.query.search // Check for equality if it's a number or string
    );
    res.send(filterStudent);
    return;
  }
  res.send(users); // Return all students if no search query
});

router.post("/smit-registration", async (req, res) => {
  const {
    fullName,
    fatherName,
    password,
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
  } = req.body;

  const { error } = UserValidationSchema.validate(req.body);

  if (error) {
    return sendResponse(res, 400, null, true, error.details[0].message); // Return the validation error message
  }

  try {
    // Check if a user already exists by email, mobileNo, or cnic
    const existingUser = await User.findOne({
      $or: [{ email: email }, { mobileNo: mobileNo }, { cnic: cnic }],
    });

    if (existingUser) {
      return sendResponse(res, 400, null, true, "User already exists with this email, mobile number, or CNIC.");
    }

    // Create a new user object
    const newUser = new User({
      fullName,
      fatherName,
      password,
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
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    // Return success response with the saved user data
    return sendResponse(res, 201, savedUser, false, `User ${fullName} added successfully`);
  } catch (error) {
    console.error("Error saving user:", error.message);
    return sendResponse(res, 500, null, true, "Error saving user");
  }
});

router.get("/:id", (req, res) => {
  const getStudent = students.find((student) => student.roll_number == req.params.roll_number);
  if (!getStudent) return res.status(404).send("Student not found");
  res.status(200).send(getStudent);
});

router.put("/", authorizationUser, async (req, res) => {
  try {
    const { isChecked, isVerified } = req.body;
    const student = await Student.findOneAndUpdate(
      {
        _id: req.student._id,
      },
      {
        isChecked,
        isVerified,
      }
    ).exec();
    sendResponse(res, 200, student, false, "Student updated successfully.");
  } catch (error) {
    sendResponse(res, 500, null, true, "Something went wrong");
  }
});

router.delete("/", authorizationUser, async (req, res) => {
  try {
    const { city, country } = req.body;
    const student = await Student.findOneAndUpdate(
      {
        _id: req.student._id,
      },
      {
        city,
        country,
      }
    ).exec();
    sendResponse(res, 200, student, false, "Student updated successfully.");
  } catch (error) {
    sendResponse(res, 500, null, true, "Somthing went wrong");
  }
});

router.get("/myInfo", authorizationUser, async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.student._id,
    });
    sendResponse(res, 200, student, false, "Student updated Suceesfully");
  } catch (error) {
    sendResponse(res, 404, null, true, "Somthing went wrong");
  }
});

export default router;
