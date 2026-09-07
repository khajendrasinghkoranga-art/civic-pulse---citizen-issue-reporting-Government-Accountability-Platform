const { isAllowedFile, maxFileSize } = require("../config/storage");

/** Validate files after a multipart parser has populated req.file or req.files. */
const validateUploadedFiles = (req, res, next) => {
  const files = req.files || (req.file ? [req.file] : []);
  if (files.some((file) => !isAllowedFile(file))) return res.status(400).json({ success: false, message: `Files must be JPEG, PNG, WEBP, or PDF and no larger than ${maxFileSize} bytes` });
  next();
};

module.exports = { validateUploadedFiles };
