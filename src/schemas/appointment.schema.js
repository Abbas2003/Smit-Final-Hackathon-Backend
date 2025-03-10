import Joi from "joi";

const appointmentValidationSchema = Joi.object({
  loanId: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string().required(),
  officeLocation: Joi.string().required()
});

export default appointmentValidationSchema;
