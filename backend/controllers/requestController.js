const {
  createFormRequest,
  createRequestLog,
  getLogsByRequest,
  checkExistingRegularRequest,
  getMyRequestsFromModel,
  checkExistingTranscriptRequest,
} = require("../models/Requests");

const { createNotification } = require("../models/Notifications");

// 📌 Submit Proforma Request
const submitProformaRequest = async (req, res) => {
  try {
    const studentId = req.user.id; // ✅ AuthMiddleware se aata hai
    const { form_type, sem_num, exam_type } = req.body;
    console.log("📥 req.body in submitProformaRequest:", req.body);

    console.log("📥 Incoming Proforma Request:", { form_type, sem_num, exam_type });

    // 🔎 Validation
    if (!form_type || !sem_num || !exam_type) {
      return res.status(400).json({
        message: "⚠️ Missing required fields: form_type, sem_num, or exam_type",
      });
    }

    // 🔎 Regular exam duplicate restriction
    if (exam_type === "Regular") {
      const alreadyExists = await checkExistingRegularRequest(studentId, sem_num);
      if (alreadyExists) {
        return res.status(400).json({
          message:
            "❌ You have already applied for this semester as Regular. Please select Improved instead.",
        });
      }
    }

    // 1️⃣ Create Request
    const requestId = await createFormRequest(
      studentId,
      form_type,     // ✅ Dynamic form type (e.g. "Proforma")
      sem_num,
      exam_type
    );

    // 2️⃣ Create Log entry
    await createRequestLog(requestId, "Submitted", studentId);

    // 3️⃣ Create Notification
    await createNotification(
      studentId,
      "Proforma Request Submitted ✅",
      `Your ${form_type} request for Semester ${sem_num} (${exam_type}) has been submitted successfully.`
    );


    // ✅ Success response
    return res.status(201).json({
      message: "✅ Proforma request submitted successfully!",
      requestId,
    });

  } catch (err) {
    console.error("❌ submitProformaRequest error:", err);
    return res
      .status(500)
      .json({ message: "❌ Server error while submitting proforma" });
  }
};


// 📌 Get Logs for a Request
const getRequestLogs = async (req, res) => {
  try {
    const { requestId } = req.params;
    const data = await getLogsByRequest(requestId);
    return res.status(200).json(data);
  } catch (err) {
    console.error("getRequestLogs error:", err);
    return res.status(500).json({ message: "Server error while fetching logs" });
  }
};

// 📌 Check Duplicate Request (frontend call jab voucher generate hota hai)
const checkDuplicateRegular = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { sem_num, exam_type } = req.body;

    if (exam_type === "Regular") {
      const alreadyExists = await checkExistingRegularRequest(studentId, sem_num);
      if (alreadyExists) {
        return res
          .status(400)
          .json({ message: "⚠️ You already applied for this semester as Regular." });
      }
    }

    return res.status(200).json({ message: "✅ No conflict, you can proceed." });
  } catch (err) {
    console.error("checkDuplicateRegular error:", err);
    return res.status(500).json({ message: "Server error while checking duplicate request" });
  }
};
const getMyRequests = async (req, res) => {
  console.log("🔥 getMyRequests controller reached, user:", req.user);
  try {
    const data = await getMyRequestsFromModel(req, res);
    // Model already sends response, no need to send again
  } catch (err) {
    console.error("getMyRequests error:", err);
    res.status(500).json({ message: "Server error while fetching requests" });
  }
};
// 📌 Submit Transcript Request
const submitTranscriptRequest = async (req, res) => {
  try {
    const studentId = req.user.id; // ✅ Logged in user id
    const { department, program } = req.body;

    if (!department || !program) {
      return res.status(400).json({ message: "⚠️ Missing required fields!" });
    }
    const alreadyExists = await checkExistingTranscriptRequest(studentId);
    if (alreadyExists) {
      return res.status(400).json({
        message: "❌ You have already submitted the Transcript request."
      });
    }

    // 1️⃣ Create Request
    const requestId = await createFormRequest(
      studentId,
      "Transcript Request",   // form_type fixed for transcript
      null,                   // sem_num not needed
      null                    // exam_type not needed
    );

    // 2️⃣ Create Log
    await createRequestLog(requestId, "Submitted", studentId);

    // 3️⃣ Notification
    await createNotification(
      studentId,
      "Transcript Request Submitted ✅",
      "Your transcript request has been submitted successfully."
    );

    res.status(201).json({
      message: "✅ Transcript request submitted!",
      requestId
    });

  } catch (err) {
    console.error("submitTranscriptRequest error:", err);
    res.status(500).json({ message: "❌ Server error while submitting transcript" });
  }
};
// 📌 Check Duplicate Transcript Request
const checkDuplicateTranscript = async (req, res) => {
  try {
    const studentId = req.user.id;

    const alreadyExists = await checkExistingTranscriptRequest(studentId);
    if (alreadyExists) {
      return res.status(400).json({
        message: "❌ You have already submitted the Transcript request."
      });
    }

    return res.status(200).json({ message: "✅ No conflict, you can proceed." });
  } catch (err) {
    console.error("checkDuplicateTranscript error:", err);
    return res.status(500).json({ message: "Server error while checking duplicate transcript" });
  }
};
const submitG1Request = async (req, res) => {
  try {
    const { form_type, sem_num, courses } = req.body;
    const loggedInUserId = req.user.id;

    console.log("🔥 submitG1Request called by user:", loggedInUserId);

    // get student_id from DB
    const studentResult = await Requests.getStudentIdByUserId(loggedInUserId);
    if (!studentResult) return res.status(404).json({ message: "Student not found" });

    const student_id = studentResult.id;

    // save courses JSON string
    const coursesJSON = JSON.stringify(courses);

    const requestId = await Requests.createFormRequest({
      student_id,
      form_type,
      sem_num,
      courses: coursesJSON,   // 👈 pass courses
      exam_type: null         // not required for G-1
    });

    res.status(201).json({ message: "G-1 Form submitted successfully", requestId });
  } catch (err) {
    console.error("❌ submitG1Request error:", err);
    res.status(500).json({ message: "Server error while submitting G-1 form" });
  }
};

module.exports = {
  submitProformaRequest,
  getRequestLogs,
  checkDuplicateRegular,
  getMyRequests,
  submitTranscriptRequest,
  checkDuplicateTranscript,
  submitG1Request,
};
