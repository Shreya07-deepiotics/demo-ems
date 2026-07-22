import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/ApiResponse.js';

// ─── GET /api/notifications/me ───────────────────────────────────────────────
export const getMyNotifications = asyncHandler(async (req, res) => {
  const { read, page = 1, limit = 20 } = req.query;
  const filter = { user: req.user._id };
  if (read !== undefined) filter.read = read === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

  return sendSuccess(res, notifications, 'Notifications fetched', 200, {
    total,
    unreadCount,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// ─── PUT /api/notifications/:id/read ─────────────────────────────────────────
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { read: true } },
    { new: true }
  );
  if (!notification) return sendError(res, 'Notification not found', 404);
  return sendSuccess(res, notification, 'Notification marked as read');
});

// ─── PUT /api/notifications/read-all ─────────────────────────────────────────
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
  return sendSuccess(res, null, 'All notifications marked as read');
});
