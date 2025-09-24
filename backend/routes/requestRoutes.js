const express = require("express");
const router = express.Router();
const { submitProforma, getMyRequests } = require("../controllers/requestController");
const { verifyToken } = require("../middlewares/authMiddleware");
const FormRequest = require("../models/FormRequest");

// Route to submit a proforma request
router.post("/proforma", verifyToken, submitProforma);

// Route to get all requests for the logged-in student
router.get("/my", verifyToken, (req, res) => {
  console.log("✅ /my route hit, user:", req.user);
  getMyRequests(req, res);
});


// Route to get logs for a specific request

router.get("/logs/:requestId", verifyToken, async (req, res) => {
  try {
    const data = await FormRequest.getLogsByRequest(req.params.requestId);
    res.json(data);
  } catch (err) {
    console.error("Fetching logs error:", err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});


// requestRoutes.js

router.post("/check-regular", verifyToken, async (req, res) => {
  console.log("✅ Check-regular route hit", req.body);

  try {
    const { sem_num, exam_type } = req.body;
    const studentId = req.user.student_id;

    const alreadyRegular = await FormRequest.checkExistingRegularRequest(studentId, sem_num);

    if (alreadyRegular && exam_type !== "Improved") {
      return res
        .status(400)
        .json({ message: "⚠️ You already applied for this semester proforma form." });
    }

    res.json({ message: "OK" }); // sab theek hai
  } catch (err) {
    console.error("Check regular error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
