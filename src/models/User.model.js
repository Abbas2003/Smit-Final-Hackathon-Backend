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
      required: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
      validate: {
        validator: function (v) {
          // Password is required if role is 'student', 'admin', or 'trainer'
          if (this.role === "user") {
            return true; // Password is optional for 'user' role
          }
          return v != null && v.length >= 8; // Password is required for other roles
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
    // image: {
    //     type: String,

    // },
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
      unique: false, // Change it later to true
      validate: {
        validator: function (v) {
          return /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid CNIC!`,
      },
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    education: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
        required: true,
      },
    
    course: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
    
    batchNo: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
      },
    
    rollNo: {
      type: String,
    },
    proficiency: {
      type: String,
      required: true,
      enum: ["None", "Beginner", "Intermediate", "Advanced"],
    },
    role: {
      type: [String],
      enum: ["user", "student", "admin", "trainer", "staff"],
      default: ["user"],
    },
    haveLaptop: {
      type: String,
      required: true,
      enum: ["Yes", "No"],
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
