const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const prisma = require("../../config/database");
const { uploadDirectory, allowedMimeTypes, maxFileSize, publicFileUrl } = require("../../config/storage");

const extensionByMimeType = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "application/pdf": ".pdf" };

const decodeFile = ({ contentBase64, contentType }) => {
  if (!allowedMimeTypes.has(contentType)) throw new Error("Unsupported file type");
  if (typeof contentBase64 !== "string" || !contentBase64) throw new Error("File content is required");
  const payload = contentBase64.replace(/^data:[^;]+;base64,/, "");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(payload)) throw new Error("File content must be valid base64");
  const buffer = Buffer.from(payload, "base64");
  if (!buffer.length || buffer.length > maxFileSize) throw new Error(`File must be between 1 byte and ${maxFileSize} bytes`);
  return buffer;
};

const uploadIssueEvidence = async (issueId, userId, data) => {
  const issue = await prisma.issue.findUnique({ where: { id: issueId }, select: { id: true, reporterId: true } });
  if (!issue) throw new Error("Issue not found");
  if (issue.reporterId !== userId) throw new Error("You can only add evidence to your own issue");
  const buffer = decodeFile(data);
  const filename = `${crypto.randomUUID()}${extensionByMimeType[data.contentType]}`;
  await fs.mkdir(uploadDirectory, { recursive: true });
  await fs.writeFile(path.join(uploadDirectory, filename), buffer, { flag: "wx" });
  try {
    return await prisma.issueEvidence.create({ data: { issueId, uploadedBy: userId, fileUrl: publicFileUrl(filename), fileType: data.contentType, fileSize: buffer.length } });
  } catch (error) {
    await fs.unlink(path.join(uploadDirectory, filename)).catch(() => {});
    throw error;
  }
};

module.exports = { uploadIssueEvidence };
