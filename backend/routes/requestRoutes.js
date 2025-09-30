const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");
const {
  submitProformaRequest,
  getRequestLogs,
  checkDuplicateRegular,
  getMyRequests,
} = require("../controllers/requestController");

router.get("/my", verifyToken, authorizeRoles("student"), getMyRequests);

// 📌 Submit new Proforma request
router.post("/proforma", verifyToken, authorizeRoles("student"), submitProformaRequest);

// 📌 Get logs for a request
router.get("/:requestId/logs", verifyToken, getRequestLogs);

// 📌 Check duplicate Regular request
router.post("/check-regular", verifyToken, checkDuplicateRegular);



module.exports = router;
