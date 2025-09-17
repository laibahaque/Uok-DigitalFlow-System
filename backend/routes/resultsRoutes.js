const express = require("express");
const { fetchResults } = require("../controllers/resultsController");

const router = express.Router();

// GET /api/results/:departmentName
router.get("/:departmentName", fetchResults);

module.exports = router;
