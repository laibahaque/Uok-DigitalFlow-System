const FormRequest = require("../models/FormRequest");

// ✅ Student: Submit Proforma
const submitProforma = async (req, res) => {
  try {
    const { sem_num, exam_type } = req.body;
    const studentId = req.user.student_id;

    if (!studentId) return res.status(400).json({ message: "student_id missing" });

    // Prevent duplicate Regular
    const alreadyRegular = await FormRequest.checkExistingRegularRequest(studentId, sem_num);
    if (alreadyRegular && exam_type !== "Improved") {
      return res.status(400).json({
        message: "You already applied Regular for this semester. Only Improved is allowed now."
      });
    }

    // Insert request
    const requestId = await FormRequest.createFormRequest(
      studentId,
      "Proforma",
      sem_num,
      exam_type
    );

    await FormRequest.createRequestLog(requestId, "Submitted", "student");

    res.status(201).json({ message: "Proforma request submitted", requestId });
  } catch (err) {
    console.error("Proforma submission error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ✅ Student: My Requests
const getMyRequests = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }
    const studentId = req.user.student_id;
    const requests = await FormRequest.getRequestsByStudent(studentId);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};
// ✅ Dept Admin: Requests of their department (abhi ke liye ALL hi fetch ho rahe hain)
const getDepartmentRequests = async (req, res) => {
  console.log("🎯 Role in getDepartmentRequests:", req.user.role);

  try {
    if (req.user.role !== "dept_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const requests = await FormRequest.getAllRequests(); // ✅ ab ye kaam karega
    res.json(requests);

  } catch (err) {
    console.error("❌ Dept requests error:", err);
    res.status(500).json({ message: "Failed to fetch department requests" });
  }
};



module.exports = {
  submitProforma,
  getMyRequests,
  getDepartmentRequests
};
