import mongoose from 'mongoose';

// Define the schema
const assignmentSchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to the Instructor model
  },
  batchNo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch', // Refers to the Instructor model
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course', // Refers to the Instructor model
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section', // Refers to the Instructor model
  },
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: [{
    type: String,
    enum: ["inactive", "active", "completed"],
    default: "active",
  }],
  dueDate: {
    type: Date,
  },

}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
});

// Create the model
const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;