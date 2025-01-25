import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    classTitle: {
      type: String,
      required: true,  
    },
    classType: {
      type: String,
      enum: ["Auditorium", "Computer_Lab"],  
      required: true,  
    },
    capacity: {
      type: Number,
      required: true,  
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',  
      required: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',  
      required: true,
    },
    createdBy: {
      type: String,
      default: null,  
    },
    updates: [
      {
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: String, default: null },
       
      },
    ],
  },
  {
    timestamps: true,  // This adds createdAt and updatedAt fields
  }
);

const Class = mongoose.model("Class", classSchema);

export default Class;
