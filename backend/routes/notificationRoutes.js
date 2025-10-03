const express = require("express");
const router = express.Router();
const { getNotificationsByUser, markNotificationAsRead } = require("../controllers/notificationController");
const { verifyToken } = require("../middlewares/authMiddleware");

// ✅ Get all notifications
router.get("/", verifyToken, getNotificationsByUser);

// ✅ Mark notification as read
router.put("/:id/read", verifyToken, markNotificationAsRead);

module.exports = router;
