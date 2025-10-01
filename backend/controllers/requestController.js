const {
  createFormRequest,
  createRequestLog,
  getLogsByRequest,
  checkExistingRegularRequest,
  getMyRequestsFromModel,
  checkExistingTranscriptRequest,
  getSubmittedRequestsFromModel,
  getApprovedRequestsFromModel,
  updateRequestStatusInModel,
  getRequestById,
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
    const studentId = req.user.id;
    const { form_type, sem_num, courses } = req.body;
    const exam_type = "Regular"; // ya frontend se bhejna ho to wo

    // Courses string ko parse karo
    let parsedCourses;
    try {
      parsedCourses = JSON.parse(courses);
    } catch (e) {
      return res.status(400).json({ message: "Invalid courses format" });
    }

    if (!form_type || !sem_num || parsedCourses.length === 0) {
      return res.status(400).json({
        message: "⚠️ Missing required fields: form_type, sem_num, courses",
      });
    }

    let createdRequests = [];

    for (const c of parsedCourses) {
      if (!c.id) continue; // skip agar id nahi hai

      const requestId = await createFormRequest(
        studentId,
        form_type,    // "G1"
        sem_num,      // selected semester
        exam_type,
        c.id          // ✅ actual course_id
      );

      await createRequestLog(requestId, "Submitted", studentId);

      await createNotification(
        studentId,
        "G1 Request Submitted ✅",
        `Your ${form_type} request for Semester ${sem_num} with Course ${c.code} - ${c.name} has been submitted successfully.`
      );

      createdRequests.push(requestId);
    }

    return res.status(201).json({
      message: `✅ G1 request submitted for ${createdRequests.length} course(s)!`,
      requestIds: createdRequests,
    });

  } catch (err) {
    console.error("❌ submitG1Request error:", err);
    return res.status(500).json({ message: "❌ Server error while submitting G1" });
  }
};

const getSubmittedRequests = async (req, res) => {
  try {
    const data = await getSubmittedRequestsFromModel();
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ getSubmittedRequests error:", err);
    return res.status(500).json({ message: "Server error while fetching submitted requests" });
  }
};
const getApprovedRequests = async (req, res) => {
  try {
    const { formType } = req.query; // optional filter
    const data = await getApprovedRequestsFromModel(formType);
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ getApprovedRequests error:", err);
    res.status(500).json({ message: "Server error while fetching approved requests" });
  }
};
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;           // request_id
    const { status } = req.body;         // "Approved" or "Rejected"
    const adminId = req.user.id;         // Faculty Admin

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "❌ Invalid status" });
    }

    // 1️⃣ Update main requests table
    const result = await updateRequestStatusInModel(id, status);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "❌ Request not found" });
    }

    // 2️⃣ Create log entry
    await createRequestLog(id, status, adminId);

    // 3️⃣ Fetch details for notification
    const requestDetails = await getRequestById(id);
    if (!requestDetails) {
      return res.status(404).json({ message: "❌ Request not found after update" });
    }

    // 4️⃣ Notify student
    const title = "Request Status Update";
    const msg = `Your ${requestDetails.form_type} request for Semester ${requestDetails.sem_num || ""} has been ${status}.`;

     await createNotification(
      req.user.id,  // ✅ logged in user id (auth se)
      title,
      msg
    );
    return res.status(200).json({ message: `✅ Request ${status} successfully!` });
  } catch (err) {
    console.error("❌ updateRequestStatus error:", err);
    return res.status(500).json({ message: "Internal server error" });
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
  getSubmittedRequests,
  getApprovedRequests,
  updateRequestStatus,
};