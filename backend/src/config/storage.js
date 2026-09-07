const path = require("path");

const uploadDirectory = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const maxFileSize = Number(process.env.MAX_UPLOAD_SIZE_BYTES) || 5 * 1024 * 1024;

const isAllowedFile = (file) => Boolean(file && allowedMimeTypes.has(file.mimetype) && file.size <= maxFileSize);
const publicFileUrl = (filename) => `/uploads/${encodeURIComponent(filename)}`;

module.exports = { uploadDirectory, allowedMimeTypes, maxFileSize, isAllowedFile, publicFileUrl };
