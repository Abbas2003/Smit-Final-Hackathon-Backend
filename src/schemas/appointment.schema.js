import Joi from "joi";

const appointmentValidationSchema = Joi.object({
  loanId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Loan ID is required",
      "string.pattern.base": "Loan ID must be a valid MongoDB ObjectId",
    }),
  tokenNumber: Joi.string().required().messages({
    "string.empty": "Token number is required",
  }),
  date: Joi.date().required().messages({
    "date.base": "Date must be a valid date",
    "any.required": "Date is required",
  }),
  time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/) // Matches HH:mm format
    .required()
    .messages({
      "string.empty": "Time is required",
      "string.pattern.base": "Time must be in HH:mm format (24-hour clock)",
    }),
  officeLocation: Joi.string().required().messages({
    "string.empty": "Office location is required",
  }),
  qrCode: Joi.string().uri().allow(null, "").messages({
    "string.uri": "QR Code must be a valid URI",
  }),
});

export default appointmentValidationSchema;
