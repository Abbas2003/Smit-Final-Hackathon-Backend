// import express from "express";
// import teachers from "../data/teacher.js";

// const router = express.Router();


// router.get("/", (req, res) => {

//   if (req.query.search) {
//     const searchTerm = req.query.search.toLowerCase(); // Make search case-insensitive
//     console.log(searchTerm);
//     const filterTeachers = teachers.filter((teacher) =>
//       teacher.fullname.toLowerCase().includes(searchTerm) ||
//       teacher.email.toLowerCase().includes(searchTerm) ||
//       teacher.mobile_Number.toLowerCase().includes(searchTerm) ||
//       teacher.cnic.toLowerCase().includes(searchTerm) ||
//       teacher.subject.toLowerCase().includes(searchTerm) || // Subject matching
//       teacher.city.toLowerCase().includes(searchTerm) ||
//       teacher.gender.toLowerCase().includes(searchTerm) ||
//       teacher.date_of_birth.toLowerCase().includes(searchTerm) ||
//       teacher.address.toLowerCase().includes(searchTerm) ||
//       teacher.id == req.query.search // Check for equality if it's a number or string
//     );
//     res.send(filterTeachers);
//     return;
//   }
  
//   res.send(teachers); // Return all students if no search query
// });



// export default router;









// // // const {students} = apistudents;
// // router.get("/", (req, res) => {
// //   res.status(200).json({
// //     success: true,
// //     data: students,
// //     message: "Students fetched successfully",
// //   });
// // });


// // router.post("/", async (req, res)=>{
// //   const { student } = req.body;
// //   // let newStudent = new Student({student});
// //   let newStudent = await newStudent.save();
// //   sendResponse(res, 201, newStudent, false, "Student added successfully")
// // })



// // console.log('Middleware Path:', '../middleware/roleMiddleware.js');

// // router.get("/", async (req, res)=>{  
// //   let students = await Student.find();
// //   sendResponse(res, 200, students, false, "Student fetched successfully")
// // })


// // router.get("/", async (req, res)=>{
// //   console.log("request=>"+ req)  
// //   console.log("response=>"+ res)  
// //     // let students = await res;
// //     sendResponse(res, 200, students, false, "Student fetched successfully")
// //   })
  

  














// // router.post("/create-course", protect, adminOnly, createCourse);
// // router.get("/all-students", protect, adminOnly, getAllStudents);
// // router.put("/update-student/:id", protect, adminOnly, updateStudent);
// // router.delete("/delete-student/:id", protect, adminOnly, deleteStudent);






// // Creating a new student
// // router.post("/", async (req, res) => {
// //   const { name, email, age, courses } = req.body;

// //   try {
// //     // Validate all fields one by one
// //     if (!name || name.length > 20) {
// //       return res.status(400).json({ error: true, message: "Name is required and must be less than 20 characters" });
// //     }

// //     if (!email) {
// //       return res.status(400).json({ error: true, message: "Email is required" });
// //     }

// //     const existingEmail = await Student.findOne({ email });
// //     if (existingEmail) {
// //       return res.status(400).json({ error: true, message: "Email already registered" });
// //     }

// //     if (age < 15 || age > 60) {
// //       return res.status(400).json({ error: true, message: "Age must be between 15 and 60" });
// //     }

// //     if (courses && courses.some(course => !["Web&MobileApp", "GraphicDesigning", "DataScience", "CyberSecurity", "3DAnimation"].includes(course))) {
// //       return res.status(400).json({ error: true, message: "Invalid course(s) selected" });
// //     }

// //     // If all validations pass, create a new student
// //     const student = new Student({ name, email, age, courses });
// //     const result = await student.save();
// //     res.status(201).json({ error: false, message: "Student created successfully", student: result });
// //   } catch (err) {
// //     res.status(500).json({ error: true, message: "An error occurred", details: err.message });
// //   }
// // });

// // // Get All Students
// // router.get("/", async (req, res) => {
// //   try {
// //     const students = await Student.find();
// //     if (students.length === 0) {
// //       return res.json({ error: false, message: "No students found", data: [] });
// //     }
// //     res.json({ error: false, data: students });
// //   } catch (error) {
// //     res.status(500).json({ error: true, message: error.message });
// //   }
// // });

// // export default router;










// // // Payment processing



// // // import Stripe from "stripe";

// // // const stripe = new Stripe(process.env.STRIPE_SECRET);

// // // router.post("/pay", protect, studentOnly, async (req, res) => {
// // //   const session = await stripe.checkout.sessions.create({
// // //     payment_method_types: ["card"],
// // //     line_items: [
// // //       {
// // //         price_data: {
// // //           currency: "usd",
// // //           product_data: { name: "Course Fee" },
// // //           unit_amount: 5000, // e.g., $50
// // //         },
// // //         quantity: 1,
// // //       },
// // //     ],
// // //     mode: "payment",
// // //     success_url: `${process.env.CLIENT_URL}/success`,
// // //     cancel_url: `${process.env.CLIENT_URL}/cancel`,
// // //   });

// // //   res.json({ url: session.url });
// // // });
