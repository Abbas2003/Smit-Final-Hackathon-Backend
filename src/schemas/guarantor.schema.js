import Joi from "joi";

const guarantorValidationSchema = Joi.object({
  userId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "User ID is required",
      "string.pattern.base": "User ID must be a valid MongoDB ObjectId",
    }),
  name: Joi.string().required().messages({
    "string.empty": "Guarantor name is required",
  }),
  email: Joi.string()
    .email()
    .allow(null, "")
    .messages({
      "string.email": "Please provide a valid email address",
    }),
  location: Joi.string().allow(null, "").messages({
    "string.empty": "Location cannot be empty",
  }),
  cnic: Joi.string()
    .regex(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/)
    .required()
    .messages({
      "string.empty": "CNIC is required",
      "string.pattern.base": "CNIC must follow the XXXXX-XXXXXXX-X format",
    }),
  relation: Joi.string().allow(null, "").messages({
    "string.empty": "Relation cannot be empty",
  }),
});

export default guarantorValidationSchema;
