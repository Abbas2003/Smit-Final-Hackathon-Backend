import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().min(6).required(),
});


export const userSchema = Joi.object({
  fullName: Joi.string().required().trim(),
  fatherName: Joi.string().trim().allow(''), // Allow empty string for optional fields
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
  }),
  email: Joi.string().email().required().trim(),
  mobileNo: Joi.string().regex(/^(03)[0-9]{9}$/).messages({
    'string.pattern.base': 'Invalid phone number format. Must start with 03 and have 11 digits',
  }),
  cnic: Joi.string().regex(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/).required().messages({
    'string.pattern.base': 'Invalid CNIC format (e.g., 12345-1234567-1)',
  }),
  address: Joi.string().trim().allow(''), // Allow empty string for optional fields
  role: Joi.string().valid('user', 'admin').default('user'),
  imageUrl: Joi.string(),
});
