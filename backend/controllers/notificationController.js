const Notification = require("../models/Notifications");

// ✅ Get all notifications of logged-in user
const getNotificationsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await Notification.getNotificationsByUserId(userId);
    res.json({ notifications: rows });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await Notification.markAsRead(id, userId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("❌ Error marking notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getNotificationsByUser, markNotificationAsRead };
