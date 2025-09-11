const express = require("express");
const { getStudentInfo, getAdminInfo } = require("../controllers/userController");

const router = express.Router();

/**
 * @route   GET /api/user/student/:id
 * @desc    Get student details by user.id (joins with students)
 * @access  Private (Student only)
 */
router.get("/student/:id", getStudentInfo);

/**
 * @route   GET /api/user/admin/:id
 * @desc    Get admin details by ID
 * @access  Private (Admin only)
 */
router.get("/admin/:id", getAdminInfo);

module.exports = router;
