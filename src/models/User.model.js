import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      validate: {
        validator: function (v) {
          return v != null && v.length >= 6; 
        },
        message: (props) => "Password is required and must be at least 8 characters long!",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    mobileNo: {
      type: String,
      unique: false, // Change it later to true
      validate: {
        validator: function (v) {
          return /^03[0-9]{9}$/.test(v); // Validates phone numbers starting with '03' and having 11 digits
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    cnic: {
      type: String,
      unique: true, // Change it later to true
      validate: {
        validator: function (v) {
          return /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid CNIC!`,
      },
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
