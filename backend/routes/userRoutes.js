const express = require("express");
const {
  getStudentInfo,
  getAdminInfo,
  changePassword,
} = require("../controllers/userController");
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Sirf student apna info dekh sakta hai
router.get("/student/me", verifyToken, authorizeRoles("student"), getStudentInfo);

// ✅ Sirf admin apna info dekh sakta hai
router.get("/admin/me", verifyToken, authorizeRoles("faculty-admin", "university-admin"), getAdminInfo);

// ✅ Sirf student apna password change kar sakta hai
router.put("/password", verifyToken, authorizeRoles("student"), changePassword);

module.exports = router;
