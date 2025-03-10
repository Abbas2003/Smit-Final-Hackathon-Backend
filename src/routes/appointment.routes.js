import express from "express";
import Appointment from "../models/Appointment.model.js";
import Loan from "../models/Loan.model.js";
import { generateTokenNumber } from "../actions/generateToken.js";
import { generateQRCode } from "../actions/generateQRCode.js";
import generatePDFSlip from "../actions/generatePDF.js";
import { authorizationAdmin } from "../middlewares/authorization.js";

const router = express.Router();

/**
 * @route   POST /api/appointments/schedule
 * @desc    Schedule an appointment and generate slip
 * @access  Private
 */
router.post('/schedule', authorizationAdmin, async (req, res) => {
  try {
    const { loanId, date, time, officeLocation, userId } = req.body;

    // Validate loan exists and belongs to user
    const loan = await Loan.findOne({ 
      _id: loanId,
      userId: userId
    }).populate('userId');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Check if slot is available (you might want to add more complex availability logic)
    const existingAppointment = await Appointment.findOne({
      officeLocation,
      date: new Date(date),
      time
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This appointment slot is no longer available' });
    }

    // Generate token number
    const tokenNumber = await generateTokenNumber(date);

    // Generate QR code data
    const qrData = JSON.stringify({
      tokenNumber,
      date,
      time,
      officeLocation,
      loanId
    });

    const qrCodeImage = await generateQRCode(qrData);

    // Create appointment
    const newAppointment = new Appointment({
      loanId,
      tokenNumber,
      date: new Date(date),
      time,
      officeLocation,
      qrCode: qrCodeImage,
      status: 'scheduled'
    });

    await newAppointment.save();

    // Update loan with appointment id
    loan.appointment = newAppointment._id;
    await loan.save();

    // Prepare data for PDF
    const appointmentData = {
      tokenNumber,
      date: new Date(date),
      time,
      officeLocation,
      applicantName: loan.userId.fullName,
      applicantCNIC: loan.userId.cnic,
      loanCategory: `${loan.category} - ${loan.subcategory}`,
      loanAmount: loan.amount
    };

    // Generate PDF slip
    const pdfBuffer = await generatePDFSlip(appointmentData, qrCodeImage);


    return res.status(200).json({
      appointment: {
        _id: newAppointment._id,
        date: newAppointment.date,
        time: newAppointment.time,
        tokenNumber: newAppointment.tokenNumber,
        officeLocation: newAppointment.officeLocation,
        status: newAppointment.status
      },
      slip: {
        buffer: pdfBuffer.toString('base64'),
        fileName: `appointment_slip_${tokenNumber}.pdf`
      }
    });

  } catch (error) {
    console.error('Error scheduling appointment:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

// /**
//  * @route   GET /api/appointments/:id/slip
//  * @desc    Get appointment slip by appointment ID
//  * @access  Private
//  */
// router.get('/:id/slip', auth, async (req, res) => {
//   try {
//     const appointment = await Appointment.findOne({
//       _id: req.params.id
//     }).populate({
//       path: 'applicationId',
//       populate: [
//         { path: 'userId' },
//         { path: 'loanDetails.category' },
//         { path: 'loanDetails.subcategory' }
//       ]
//     }).populate('officeId');
    
//     if (!appointment) {
//       return res.status(404).json({ message: 'Appointment not found' });
//     }
    
//     // Check if appointment belongs to user
//     if (appointment.applicationId.userId._id.toString() !== req.user.id) {
//       return res.status(403).json({ message: 'Not authorized to access this appointment' });
//     }
    
//     // Generate QR code data
//     const qrData = JSON.stringify({
//       tokenNumber: appointment.tokenNumber,
//       date: appointment.date,
//       time: appointment.time,
//       officeId: appointment.officeId._id,
//       applicationId: appointment.applicationId._id
//     });
    
//     const qrCodeImage = await generateQRCode(qrData);
    
//     // Prepare data for PDF
//     const appointmentData = {
//       tokenNumber: appointment.tokenNumber,
//       date: appointment.date,
//       time: appointment.time,
//       officeName: appointment.officeId.name,
//       officeAddress: appointment.officeId.address,
//       applicantName: appointment.applicationId.userId.name,
//       applicantCNIC: appointment.applicationId.userId.cnic,
//       loanCategory: `${appointment.applicationId.loanDetails.category.name} - ${appointment.applicationId.loanDetails.subcategory.name}`,
//       loanAmount: appointment.applicationId.loanDetails.amount
//     };
    
//     // Generate PDF slip
//     const pdfBuffer = await generatePDFSlip(appointmentData, qrCodeImage);
    
//     // Send response with appointment data and slip
//     return res.json({
//       appointment: {
//         _id: appointment._id,
//         date: appointment.date,
//         time: appointment.time,
//         tokenNumber: appointment.tokenNumber,
//         office: {
//           name: appointment.officeId.name,
//           address: appointment.officeId.address
//         }
//       },
//       slip: {
//         buffer: pdfBuffer.toString('base64'),
//         fileName: `appointment_slip_${appointment.tokenNumber}.pdf`
//       }
//     });
//   } catch (error) {
//     console.error('Error generating appointment slip:', error);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// /**
//  * @route   GET /api/appointments/user
//  * @desc    Get all appointments for a user
//  * @access  Private
//  */
// router.get('/user', auth, async (req, res) => {
//   try {
//     // Find all applications for the user
//     const applications = await Application.find({ userId: req.user.id });
//     const applicationIds = applications.map(app => app._id);
    
//     // Find all appointments for those applications
//     const appointments = await Appointment.find({
//       applicationId: { $in: applicationIds }
//     }).populate('officeId applicationId');
    
//     return res.json({ appointments });
//   } catch (error) {
//     console.error('Error fetching user appointments:', error);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// // Admin Routes

// /**
//  * @route   GET /api/appointments/admin/upcoming
//  * @desc    Get upcoming appointments (admin only)
//  * @access  Private/Admin
//  */
// router.get('/admin/upcoming', [auth, adminAuth], async (req, res) => {
//   try {
//     const { date, officeId, status } = req.query;
    
//     const filter = {};
    
//     // Add date filter if provided
//     if (date) {
//       const startDate = moment(date).startOf('day').toDate();
//       const endDate = moment(date).endOf('day').toDate();
      
//       filter.date = {
//         $gte: startDate,
//         $lte: endDate
//       };
//     } else {
//       // Default to today and future appointments
//       filter.date = { $gte: moment().startOf('day').toDate() };
//     }
    
//     // Add office filter if provided
//     if (officeId) {
//       filter.officeId = officeId;
//     }
    
//     // Add status filter if provided
//     if (status) {
//       filter.status = status;
//     }
    
//     const appointments = await Appointment.find(filter)
//       .populate({
//         path: 'applicationId',
//         populate: [
//           { path: 'userId', select: 'name cnic email phone' },
//           { path: 'loanDetails.category' },
//           { path: 'loanDetails.subcategory' }
//         ]
//       })
//       .populate('officeId')
//       .sort({ date: 1, time: 1 });
    
//     return res.json({ appointments });
//   } catch (error) {
//     console.error('Error fetching upcoming appointments:', error);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// /**
//  * @route   PUT /api/appointments/:id/status
//  * @desc    Update appointment status (admin only)
//  * @access  Private/Admin
//  */
// router.put('/:id/status', [auth, adminAuth], async (req, res) => {
//   try {
//     const { status } = req.body;
    
//     if (!status || !['scheduled', 'completed', 'cancelled', 'no-show'].includes(status)) {
//       return res.status(400).json({ message: 'Valid status is required' });
//     }
    
//     const appointment = await Appointment.findById(req.params.id);
    
//     if (!appointment) {
//       return res.status(404).json({ message: 'Appointment not found' });
//     }
    
//     appointment.status = status;
//     await appointment.save();
    
//     // If appointment is completed, update application status
//     if (status === 'completed') {
//       await Application.findByIdAndUpdate(
//         appointment.applicationId,
//         { status: 'under_review' }
//       );
//     } else if (status === 'cancelled') {
//       await Application.findByIdAndUpdate(
//         appointment.applicationId,
//         { status: 'appointment_cancelled' }
//       );
//     }
    
//     return res.json({ appointment });
//   } catch (error) {
//     console.error('Error updating appointment status:', error);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// /**
//  * @route   POST /api/appointments/admin/schedule
//  * @desc    Schedule appointment for a user (admin only)
//  * @access  Private/Admin
//  */
// router.post('/admin/schedule', [auth, adminAuth], async (req, res) => {
//   try {
//     const { applicationId, date, time, officeId } = req.body;
    
//     if (!applicationId || !date || !time || !officeId) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }
    
//     // Validate application exists
//     const application = await Application.findById(applicationId);
    
//     if (!application) {
//       return res.status(404).json({ message: 'Application not found' });
//     }
    
//     // Check if office exists
//     const office = await Office.findById(officeId);
//     if (!office) {
//       return res.status(404).json({ message: 'Office not found' });
//     }
    
//     // Generate token number
//     const tokenNumber = await generateTokenNumber(date);
    
//     // Create appointment
//     const newAppointment = new Appointment({
//       date: new Date(date),
//       time,
//       officeId,
//       applicationId,
//       tokenNumber,
//       status: 'scheduled'
//     });
    
//     await newAppointment.save();
    
//     // Update application with appointment id
//     application.appointmentId = newAppointment._id;
//     application.status = 'appointment_scheduled';
//     await application.save();
    
//     return res.json({ appointment: newAppointment });
//   } catch (error) {
//     console.error('Error scheduling appointment by admin:', error);
//     return res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });
