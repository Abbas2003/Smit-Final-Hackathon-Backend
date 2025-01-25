import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  roll_number: { type: String },
  full_name: { type: String }, 
  email: { type: String, unique: true },
  password: { type: String },  
  course: { type: String, enum: ["Web & Mobile App", "Flutter", "3DAnimation", "AIChatbot", "Digital Marketing", "Devops"] },
  country: { type: String, enum: ["Pakistan", "Turkey"] },
  city: { type: String, enum: ["Karachi", "Islamabad", "Peshawar", "Quetta", "Lahore"] },
  computerproficiency: { type: String },
  mobile_Number: { type: String },
  cnic: { type: String },
  father_cnic: { type: String },
  gender: { type: String, enum: ["male", "female"] },
  date_of_birth: { type: Date },  // Date of birth
  address: { type: String },
  last_qualification: { type: String },
  have_laptop: { type: String, enum: ["yes", "no"] },
}, { timestamps: true });  

const Student = mongoose.model('Students', studentSchema);

export default Student;
