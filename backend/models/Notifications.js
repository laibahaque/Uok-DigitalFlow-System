const db = require("../config/db");

// ✅ Create Notification
const createNotification = async (toUserId, title, message) => {
  return db.execute(
    `INSERT INTO notifications (user_id, title, message, created_at, is_read)
     VALUES (?, ?, ?, NOW(), 0)`,
    [toUserId, title, message]
  );
};

// ✅ Get Notifications for user
const getNotificationsByUserId = async (userId) => {
  return db.execute(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
};

// ✅ Mark as Read
const markAsRead = async (id, userId) => {
  return db.execute(
    `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
};

module.exports = { createNotification, getNotificationsByUserId, markAsRead };
