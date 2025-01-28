import loanValidationSchema from "../schemas/loan.schema";

const validateLoan = (req, res, next) => {
  const { error } = loanValidationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ errors: error.details.map((err) => err.message) });
  }
  next();
};

export default validateLoan;
