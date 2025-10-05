const {
  createFormRequest,
  createRequestLog,
  getLogsByRequest,
  checkExistingRegularRequest,
  getMyRequestsFromModel,
  checkExistingTranscriptRequest,
  checkExistingG1Request,
  getSubmittedRequestsFromModel,
  getApprovedRequestsFromModel,
  updateRequestStatusInModel,
  getRequestById,
  getRequestByIdWithStudent,
  getUniAdminUser,
  getFacultyAdminUser,
  autoCompleteOldRequests,
} = require("../models/Requests");

const { createNotification } = require("../models/Notifications");

// 📌 Submit Proforma Request
const submitProformaRequest = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { form_type, sem_num, exam_type } = req.body;
    console.log("📥 Incoming Proforma Request:", { form_type, sem_num, exam_type });

    if (!form_type || !sem_num || !exam_type) {
      return res.status(400).json({
        message: "⚠️ Missing required fields: form_type, sem_num, or exam_type",
      });
    }

    // 🔎 Convert comma separated semesters into array
    const semesters = sem_num.split(","); // e.g. "1,2" → ["1","2"]

    let createdRequests = [];

    for (const sem of semesters) {
      // 🔎 Regular exam duplicate restriction
      

      // 1️⃣ Create Request
      const requestId = await createFormRequest(
        studentId,
        form_type,
        sem,
        exam_type
      );

      // 2️⃣ Create Log entry
      await createRequestLog(requestId, "Submitted", studentId);

      // 3️⃣ Create Notification
      await createNotification(
        studentId,
        "Proforma Request Submitted ✅",
        `Your ${form_type} request for Semester ${sem} (${exam_type}) has been submitted successfully.`
      );

      const facultyAdmin = await getFacultyAdminUser();
      if (facultyAdmin) {
        await createNotification(
          facultyAdmin.id,
          "New Proforma Request Submitted",
          `A student submitted ${form_type} request for Semester ${sem} (${exam_type}).`
        );
      }

      createdRequests.push(requestId);
    }

    return res.status(201).json({
      message: `✅ Proforma request submitted for ${createdRequests.length} semester(s)!`,
      requestIds: createdRequests,
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
    // 4️⃣ Faculty Admin Notification
    const facultyAdmin = await getFacultyAdminUser();
    // console.log("facultyAdmin:", facultyAdmin);
    if (facultyAdmin) {
      await createNotification(
        facultyAdmin.id,
        "New Transcript Request Submitted",
        `A student submitted a transcript request.`
      );
    }
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
      const facultyAdmin = await getFacultyAdminUser();
      // console.log("facultyAdmin:", facultyAdmin);
      if (facultyAdmin) {
        await createNotification(
          facultyAdmin.id,
          "New G1 Request Submitted",
          `A student submitted a G1 request for Course ${c.code} - ${c.name} (Semester ${sem_num}).`
        );
      }

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
// 📌 Check Duplicate G1 (voucher se pehle)
const checkDuplicateG1 = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { sem_num, courses } = req.body;

    let parsedCourses;
    try {
      parsedCourses = JSON.parse(courses);
    } catch (e) {
      return res.status(400).json({ message: "Invalid courses format" });
    }

    for (const c of parsedCourses) {
      const exists = await checkExistingG1Request(studentId, sem_num, c.id);
      if (exists) {
        return res.status(400).json({
          message: `❌ You already applied for this course (${c.code}) in Semester ${sem_num}.`
        });
      }
    }

    return res.status(200).json({ message: "✅ No conflict, you can proceed." });
  } catch (err) {
    console.error("checkDuplicateG1 error:", err);
    return res.status(500).json({ message: "Server error while checking G1 duplicates" });
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
// requestsController.js

// Faculty Admin update karega
const updateRequestByFaculty = async (req, res) => {
  try {
    const { id } = req.params; // request_id
    const { status } = req.body; // Approved / Rejected
    const adminId = req.user.id; // faculty admin ka id

    if (!["Faculty Approved", "Faculty Rejected"].includes(status)) {
      return res.status(400).json({ message: "❌ Invalid status" });
    }

    // ✅ Main table update
    const result = await updateRequestStatusInModel(id, status);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "❌ Request not found" });
    }

    // ✅ Log save
    await createRequestLog(id, status, adminId);

    // ✅ Request details
    const requestDetails = await getRequestByIdWithStudent(id);
    if (!requestDetails) {
      return res.status(404).json({ message: "❌ Request not found after update" });
    }

    // 1️⃣ Student ko notification
    const studentMsg = `Your ${requestDetails.form_type} request (Semester ${requestDetails.sem_num || ""}) has been ${status} by Faculty.`;
    await createNotification(requestDetails.student_user_id, "Request Status Update", studentMsg);

    // 2️⃣ Uni Admin ko notification (except g1)
    if (requestDetails.form_type.toLowerCase() !== "G1 Form") {
      const uniMsg = `A ${requestDetails.form_type} request (Semester ${requestDetails.sem_num || ""}) was ${status} by Faculty.`;
      // uni admin user_id fetch karein
      const uniAdmin = await getUniAdminUser();
      if (uniAdmin) {
        await createNotification(uniAdmin.id, "Faculty Update", uniMsg);
      }
    }

    return res.json({ message: `✅ Request ${status} successfully by Faculty` });
  } catch (err) {
    console.error("❌ updateRequestByFaculty error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Uni Admin update karega
const updateRequestByUniAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;

    if (!["University Approved", "University Rejected"].includes(status)) {
      return res.status(400).json({ message: "❌ Invalid status" });
    }

    // ✅ Agar Uni Admin approve kare to status InProgress ho jaye
    let newStatus = status;
    if (status === "University Approved") {
      newStatus = "In Progress";
    }

    // ✅ Main table me update karo
    const result = await updateRequestStatusInModel(id, newStatus);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "❌ Request not found" });
    }

    // ✅ Logs me original action save karo (Approved/Rejected)
    await createRequestLog(id, status, adminId);

    // ✅ Student ko notify karo
    const requestDetails = await getRequestByIdWithStudent(id);
    if (!requestDetails) {
      return res.status(404).json({ message: "❌ Request not found after update" });
    }

    const studentMsg = `Your ${requestDetails.form_type} request (Semester ${requestDetails.sem_num || ""}) has been ${status} by University.`;
    await createNotification(requestDetails.student_user_id, "Request Status Update", studentMsg);

    return res.json({ message: `✅ Request ${status} successfully by Uni Admin` });
  } catch (err) {
    console.error("❌ updateRequestByUniAdmin error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const autoCompleteRequests = async (req, res) => {
  try {
    const count = await autoCompleteOldRequests();
    res.json({ message: `✅ ${count} requests marked as Completed.` });
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to auto-complete requests." });
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
  checkDuplicateG1,
  getSubmittedRequests,
  getApprovedRequests,
  updateRequestByFaculty,
  updateRequestByUniAdmin,
  autoCompleteRequests,
};