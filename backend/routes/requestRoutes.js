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
  submitG1Request,
  checkDuplicateG1,
  getSubmittedRequests ,
  getApprovedRequests,
  updateRequestByFaculty,
  updateRequestByUniAdmin,
  autoCompleteRequests,
} = require("../controllers/requestController");

router.get("/my", verifyToken, authorizeRoles("student"), getMyRequests);

// 📌 Submit new Proforma request
router.post("/proforma", verifyToken, authorizeRoles("student"), submitProformaRequest);

router.post("/g1", verifyToken, authorizeRoles("student"), submitG1Request);

// 📌 Get logs for a request
router.get("/:requestId/logs", verifyToken, getRequestLogs);
router.post("/auto-complete", autoCompleteRequests);
// 📌 Check duplicate Regular request
router.post("/check-regular", verifyToken, checkDuplicateRegular);
router.post("/check-transcript", verifyToken, checkDuplicateTranscript);
router.post("/check-duplicate-g1", verifyToken, checkDuplicateG1);

router.post(
  "/transcript",
  verifyToken,
  authorizeRoles("student"),
  submitTranscriptRequest
);
router.get(
  "/submitted",
  verifyToken,
  authorizeRoles("faculty-admin"), // ya jo admin role ho
  getSubmittedRequests
);
router.get(
  "/approved",
  verifyToken,
  authorizeRoles("university-admin"),
  getApprovedRequests
);
router.put(
  "/:id/status",
  verifyToken,
  authorizeRoles("faculty-admin"),
  updateRequestByFaculty
);

router.put(
  "/:id/unistatus",
  verifyToken,
  authorizeRoles("university-admin"),
  updateRequestByUniAdmin
);

module.exports = router;