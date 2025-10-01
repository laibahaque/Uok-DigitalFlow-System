const express = require("express");
const router = express.Router();
const { fetchCourses } = require("../controllers/courseController");


router.get("/:userId/:semester", fetchCourses);


module.exports = router;
