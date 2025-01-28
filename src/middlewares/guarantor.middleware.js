import guarantorValidationSchema from "../schemas/guarantor.schema";

const validateGuarantor = (req, res, next) => {
  const { error } = guarantorValidationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }
  next();
};

export default validateGuarantor;
