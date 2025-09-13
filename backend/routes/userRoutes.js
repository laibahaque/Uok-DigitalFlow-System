const express = require("express");
const { getStudentInfo, getAdminInfo, changePassword } = require("../controllers/userController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/student/:id", verifyToken, getStudentInfo);
router.get("/admin/:id", verifyToken, getAdminInfo);
router.put("/password/:id", verifyToken, changePassword);

module.exports = router;
