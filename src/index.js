import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import studentRoute from "./routes/student.routes.js";
import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
import courseRoute from "./routes/course.routes.js";
import campusRoute from "./routes/campus.routes.js";
import sectionRoute from "./routes/section.routes.js";
import batchRoute from "./routes/batch.routes.js";
import cityRoute from "./routes/city.routes.js";
import classRoute from "./routes/class.routes.js";
import quizRoute from "./routes/quiz.routes.js";
import assignmentRoute from "./routes/assignments.routes.js";
import userquizRoute from "./routes/userquiz.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
console.log("MONGODB_URI", process.env.MONGO_URI);


// Auth Routes
app.use("/api/v1/auth", authRoute);

// Auth Routes
app.use("/api/v1/user", userRoute);

// City Routes
app.use("/api/v1/city", cityRoute);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected successfully.");
  })
  .catch((error) => {
    console.error("Database connection error:", error.message);
    process.exit(1); // Consider removing this if you want the server to attempt reconnecting
  });
