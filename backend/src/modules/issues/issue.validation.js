const { z } = require("zod");

const createIssueSchema = z.object({
    title: z
        .string()
        .min(5, "Title must be at least 5 characters")
        .max(150, "Title must not exceed 150 characters"),

    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(5000, "Description must not exceed 5000 characters"),

    // Now references the IssueCategory model via UUID
    categoryId: z
        .string()
        .uuid("Invalid category ID"),

    priority: z
        .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
        .optional(),

    latitude: z
        .number()
        .min(-90, "Invalid latitude")
        .max(90, "Invalid latitude")
        .optional(),

    longitude: z
        .number()
        .min(-180, "Invalid longitude")
        .max(180, "Invalid longitude")
        .optional(),

    address: z
        .string()
        .max(500, "Address must not exceed 500 characters")
        .optional(),

    ward: z
        .string()
        .max(100, "Ward must not exceed 100 characters")
        .optional(),

    locality: z
        .string()
        .max(200, "Locality must not exceed 200 characters")
        .optional(),

    city: z
        .string()
        .max(100, "City must not exceed 100 characters")
        .optional(),

    state: z
        .string()
        .max(100, "State must not exceed 100 characters")
        .optional(),

    pincode: z
        .string()
        .regex(/^\d{6}$/, "Pincode must be a 6-digit number")
        .optional(),

    isAnonymous: z
        .boolean()
        .optional(),
});

const updateIssueStatusSchema = z.object({
    status: z.enum(["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"]),
    remarks: z
        .string()
        .max(1000, "Remarks must not exceed 1000 characters")
        .optional(),
});

const validateCreateIssue = (req, res, next) => {
    try {
        req.body = createIssueSchema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.issues || error.errors,
        });
    }
};

const validateUpdateIssueStatus = (req, res, next) => {
    try {
        req.body = updateIssueStatusSchema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.issues || error.errors,
        });
    }
};

module.exports = {
    createIssueSchema,
    updateIssueStatusSchema,
    validateCreateIssue,
    validateUpdateIssueStatus,
};
