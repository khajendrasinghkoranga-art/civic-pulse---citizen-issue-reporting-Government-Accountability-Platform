const prisma = require("../../config/database");

const notificationSelect = {
  id: true, type: true, title: true, message: true, isRead: true,
  createdAt: true, readAt: true, issueId: true,
};

const createNotification = ({ userId, issueId, type = "SYSTEM", title, message }) =>
  prisma.notification.create({ data: { userId, issueId, type, title, message }, select: notificationSelect });

const getNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
  const where = { userId, ...(unreadOnly ? { isRead: false } : {}) };
  const skip = (page - 1) * limit;
  const [notifications, total, unread] = await Promise.all([
    prisma.notification.findMany({ where, select: notificationSelect, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { notifications, unread, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const markRead = async (id, userId) => {
  const notification = await prisma.notification.findFirst({ where: { id, userId }, select: { id: true } });
  if (!notification) throw new Error("Notification not found");
  return prisma.notification.update({ where: { id }, data: { isRead: true, readAt: new Date() }, select: notificationSelect });
};

const markAllRead = async (userId) => {
  const result = await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() } });
  return result.count;
};

module.exports = { createNotification, getNotifications, markRead, markAllRead };
