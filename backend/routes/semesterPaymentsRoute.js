const express = require("express");
const { fetchPaymentsByDepartment } = require("../controllers/semesterPaymentsController");
const router = express.Router();

router.get("/:departmentName", fetchPaymentsByDepartment);

module.exports = router;
