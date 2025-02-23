import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
import loanRoute from "./routes/loan.routes.js";
import guarantorRoute from "./routes/guarantor.routes.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

// Default Route
// app.use("/", (req, res) => {
//   res.send("Welcome to the Microfinance System API");
// });

// Auth Routes
app.use("/api/v1/auth", authRoute);

// User Routes
app.use("/api/v1/user", userRoute);

// Guarantor Routes
app.use("/api/v1/guarantor", guarantorRoute);

// Loan Routes
app.use("/api/v1/loan", loanRoute);



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
