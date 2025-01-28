import appointmentValidationSchema from "../schemas/appointment.schema.js";

const validateAppointment = (req, res, next) => {
  const { error } = appointmentValidationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }
  next();
};

export default validateAppointment;
