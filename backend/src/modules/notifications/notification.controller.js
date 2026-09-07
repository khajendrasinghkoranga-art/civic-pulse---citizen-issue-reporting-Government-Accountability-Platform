const notificationService = require("./notification.service");

const listNotifications = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const result = await notificationService.getNotifications(req.user.id, { page, limit, unreadOnly: req.query.unreadOnly === "true" });
    res.json({ success: true, data: result.notifications, unread: result.unread, pagination: result.pagination });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to fetch notifications" }); }
};
const markRead = async (req, res) => {
  try { res.json({ success: true, data: await notificationService.markRead(req.params.id, req.user.id) }); }
  catch (error) { res.status(error.message === "Notification not found" ? 404 : 500).json({ success: false, message: error.message === "Notification not found" ? error.message : "Failed to update notification" }); }
};
const markAllRead = async (req, res) => {
  try { res.json({ success: true, data: { updated: await notificationService.markAllRead(req.user.id) } }); }
  catch (_) { res.status(500).json({ success: false, message: "Failed to update notifications" }); }
};
module.exports = { listNotifications, markRead, markAllRead };
