const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Validation failed", errors: parsed.error.issues.map(({ path, message }) => ({ field: path.join("."), message })) });
  }
  req.body = parsed.data;
  next();
};

module.exports = { validate };
