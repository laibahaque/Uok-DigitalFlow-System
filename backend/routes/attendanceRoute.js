const express = require("express");
const { fetchAttendance } = require("../controllers/attendanceController");

const router = express.Router();

router.get("/:departmentName", fetchAttendance);

module.exports = router;
