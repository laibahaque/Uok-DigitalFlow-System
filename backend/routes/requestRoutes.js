const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");
const {
  submitProformaRequest,
  getRequestLogs,
  checkDuplicateRegular,
  getMyRequests,
  submitTranscriptRequest,
  checkDuplicateTranscript,
} = require("../controllers/requestController");

router.get("/my", verifyToken, authorizeRoles("student"), getMyRequests);

// 📌 Submit new Proforma request
router.post("/proforma", verifyToken, authorizeRoles("student"), submitProformaRequest);

// 📌 Get logs for a request
router.get("/:requestId/logs", verifyToken, getRequestLogs);

// 📌 Check duplicate Regular request
router.post("/check-regular", verifyToken, checkDuplicateRegular);
router.post("/check-transcript", verifyToken, checkDuplicateTranscript);
router.post(
  "/transcript",
  verifyToken,
  authorizeRoles("student"),
  submitTranscriptRequest
);


module.exports = router;
