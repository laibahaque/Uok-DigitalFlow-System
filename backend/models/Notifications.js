const db = require("../config/db");

const createNotification = async (toUserId, title, message) => {
  await db.execute(
    `INSERT INTO notifications (user_id, title, message, created_at, is_read)
     VALUES (?, ?, ?, NOW(), 0)`,
    [toUserId, title, message]
  );
};


module.exports = { createNotification };