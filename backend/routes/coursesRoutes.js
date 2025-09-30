const express = require("express");
const router = express.Router();
const { fetchCourses } = require("../controllers/courseController");

// ✅ GET /api/courses/:studentId/:semester
router.get("/:studentId/:semester", fetchCourses);

module.exports = router;
