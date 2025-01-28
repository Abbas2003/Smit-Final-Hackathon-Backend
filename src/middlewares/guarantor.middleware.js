import Joi from "joi";
import guarantorValidationSchema from "../schemas/guarantor.schema.js";

const validateGuarantor = (data) => {
  const schema = Array.isArray(data)
    ? Joi.array().items(guarantorValidationSchema)
    : guarantorValidationSchema;

  return schema.validate(data, { abortEarly: false });
};

export default validateGuarantor;
