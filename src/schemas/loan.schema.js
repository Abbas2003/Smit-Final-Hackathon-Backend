import Joi from "joi";

const loanValidationSchema = Joi.object({
  userId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "User ID is required",
      "string.pattern.base": "User ID must be a valid MongoDB ObjectId",
    }),
  category: Joi.string().required().messages({
    "string.empty": "Category is required",
  }),
  subcategory: Joi.string().required().messages({
    "string.empty": "Subcategory is required",
  }),
  amount: Joi.number().required().min(1).messages({
    "number.base": "Amount must be a number",
    "number.empty": "Amount is required",
    "number.min": "Amount must be greater than 0",
  }),
  loanPeriod: Joi.number().required().min(1).messages({
    "number.base": "Loan period must be a number",
    "number.empty": "Loan period is required",
    "number.min": "Loan period must be at least 1 year",
  }),
  initialDeposit: Joi.number().min(0).allow(null).messages({
    "number.base": "Initial deposit must be a number",
    "number.min": "Initial deposit cannot be negative",
  }),
  status: Joi.string()
    .valid("pending", "approved", "rejected")
    .default("Pending")
    .messages({
      "any.only": "Status must be 'pending', 'approved', or 'rejected'",
    }),
  // appointment: Joi.string()
  //   .regex(/^[0-9a-fA-F]{24}$/)
  //   .allow(null)
  //   .messages({
  //     "string.pattern.base": "Appointment ID must be a valid MongoDB ObjectId",
  //   }),
});

export default loanValidationSchema;