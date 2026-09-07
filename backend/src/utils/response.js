const success = (res, data, { status = 200, message, pagination } = {}) => res.status(status).json({ success: true, ...(message ? { message } : {}), ...(data !== undefined ? { data } : {}), ...(pagination ? { pagination } : {}) });
const failure = (res, message, { status = 500, errors } = {}) => res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });
module.exports = { success, failure };
