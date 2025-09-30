const db = require("../config/db");

const createNotification = async (toUserOrRole, message) => {
  await db.execute(
    `INSERT INTO notifications (user_id, title, message)
     VALUES (?, ?, ?)`,
    [toUserOrRole, message, message]  // 👈 title & message dono string hain
  );
};

module.exports = { createNotification };
