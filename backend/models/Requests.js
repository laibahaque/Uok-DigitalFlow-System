const db = require("../config/db");

// 🔎 1. Get Student ID by logged-in user’s id
const getStudentIdByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT id FROM students WHERE user_id = ?`,
    [userId]
  );
  return rows[0]?.id || null;
};

// 📌 2. Create Form Request (dynamic for each form type)
// 📌 Create Form Request (dynamic for each form type)
const createFormRequest = async (
  loggedInUserId,
  formType,
  semNum = null,
  examType = null,
  courseId = null   // ✅ NEW
) => {
  const studentId = await getStudentIdByUserId(loggedInUserId);
  console.log("🔎 LoggedInUserId:", loggedInUserId);
  console.log("🔎 StudentId from DB:", studentId);

  if (!studentId) {
    throw new Error("❌ Student record not found for this user.");
  }

  // 🔥 Dynamic INSERT with course_id column
  const [result] = await db.execute(
    `INSERT INTO requests 
       (student_id, form_type, sem_num, exam_type, course_id, status, updated_at, created_at)
     VALUES (?, ?, ?, ?, ?, 'Submitted', NOW(), NOW())`,
    [
      studentId,
      formType,
      semNum || null,
      examType || null,
      courseId || null   // ✅ yahan save hoga
    ]
  );

  console.log("✅ Inserted Request ID:", result.insertId);
  return result.insertId;
};



// 📌 3. Create Request Log (keep updated_by = user/admin id)
const createRequestLog = async (requestId, status, updatedByUserId) => {
  await db.execute(
    `INSERT INTO request_logs (request_id, status, updated_by, created_at)
     VALUES (?, ?, ?, NOW())`,
    [requestId, status, updatedByUserId]
  );
};

// 📌 4. Get Logs by Request
const getLogsByRequest = async (requestId) => {
  const [logs] = await db.query(
    `SELECT rl.id, rl.status, rl.updated_by, rl.created_at
       FROM request_logs rl
      WHERE rl.request_id = ?
      ORDER BY rl.created_at ASC`,
    [requestId]
  );

  const [reqRow] = await db.query(
    `SELECT form_type FROM requests WHERE id = ?`,
    [requestId]
  );

  return { form_type: reqRow[0]?.form_type || "", logs };
};

// 📌 5. Check if Regular Request Already Exists
const checkExistingRegularRequest = async (loggedInUserId, semNum) => {
  // fetch student_id first
  const studentId = await getStudentIdByUserId(loggedInUserId);
  if (!studentId) return false;

  const [rows] = await db.query(
    `SELECT id FROM requests
      WHERE student_id = ? AND sem_num = ? AND exam_type = 'Regular'`,
    [studentId, semNum]
  );

  return rows.length > 0;
};
const getMyRequestsFromModel = async (req, res) => {
  try {
    console.log("🔎 getMyRequests called!");
    console.log("🔎 Logged in user ID:", req.user.id);
    const userId = req.user.id;
    const [rows] = await db.execute(
      `SELECT r.id, r.form_type, r.sem_num, r.exam_type,  r.created_at
         FROM requests r
         JOIN students s ON r.student_id = s.id
         WHERE s.user_id = ?
         ORDER BY r.created_at DESC`,
      [userId]
    );
    
    console.log("✅ Query result:", rows);
    res.status(200).json(rows);
  } catch (err) {
    console.error("DB Error in getMyRequests:", err);
    throw err;
  }
};

const checkExistingTranscriptRequest = async (loggedInUserId) => {
  const studentId = await getStudentIdByUserId(loggedInUserId);
  if (!studentId) return false;

  const [rows] = await db.query(
    `SELECT id FROM requests
       WHERE student_id = ? AND form_type = 'Transcript Request'`,
    [studentId]
  );

  return rows.length > 0;
};
const submitG1Request = async (req, res) => {
  try {
    const studentId = req.user.id; // ✅ AuthMiddleware
    const { form_type, sem_num, exam_type, selectedCourses } = req.body;

    console.log("📥 Incoming G1 Request:", req.body);

    // 🔎 Validation
    if (!form_type || !sem_num || !exam_type || !selectedCourses?.length) {
      return res.status(400).json({
        message: "⚠️ Missing required fields: form_type, sem_num, exam_type, or selectedCourses",
      });
    }

    // 1️⃣ Create Request
    const requestId = await createFormRequest(
      studentId,
      form_type,   // e.g. "G1"
      sem_num,
      exam_type
    );

    // 2️⃣ Save selected courses → requests table (column_id / junction table)
    await saveG1Courses(requestId, selectedCourses);

    // 3️⃣ Create Log
    await createRequestLog(requestId, "Submitted", studentId);

    // 4️⃣ Notification
    await createNotification(
      studentId,
      "G1 Request Submitted ✅",
      `Your ${form_type} request for Semester ${sem_num} (${exam_type}) with ${selectedCourses.length} courses has been submitted successfully.`
    );

    return res.status(201).json({
      message: "✅ G1 request submitted successfully!",
      requestId,
    });

  } catch (err) {
    console.error("❌ submitG1Request error:", err);
    return res.status(500).json({ message: "❌ Server error while submitting G1" });
  }
};
// 📌 Fetch all Submitted Requests with student + department info
const getSubmittedRequestsFromModel = async () => {
  try {
    const [rows] = await db.execute(`
      SELECT 
          r.id AS request_id,
          r.form_type,
          r.sem_num,
          r.exam_type,
          c.course_code AS course_code,
          c.course_name AS course_name,
          r.status AS request_status,
          r.created_at,
          s.id AS student_id,
          s.seat_no,
          s.program,
          d.depart_name AS department_name
      FROM requests r
      JOIN students s ON r.student_id = s.id
      JOIN departments_sci d ON s.depart_id = d.id
      LEFT JOIN courses c ON r.course_id = c.id   -- ✅ join courses
      WHERE r.status = 'Submitted'
      ORDER BY r.created_at DESC
    `);

    return rows;
  } catch (err) {
    console.error("❌ DB Error in getSubmittedRequestsFromModel:", err);
    throw err;
  }
};

const getApprovedRequestsFromModel = async (formType = null) => {
  try {
    let query = `
      SELECT 
          r.id AS request_id,
          r.form_type,
          r.sem_num,
          r.exam_type,
          c.course_code AS course_code,
          c.course_name AS course_name,
          r.status AS request_status,
          r.created_at,
          s.id AS student_id,
          s.seat_no,
          s.program,
          d.depart_name AS department_name
      FROM requests r
      JOIN students s ON r.student_id = s.id
      JOIN departments_sci d ON s.depart_id = d.id
      LEFT JOIN courses c ON r.course_id = c.id
      WHERE r.status = 'Approved'
        AND r.form_type != 'G1 Form'
    `;

    const params = [];
    if (formType) {
      query += " AND r.form_type = ?";
      params.push(formType);
    }

    query += " ORDER BY r.created_at DESC";

    const [rows] = await db.execute(query, params);
    return rows;
  } catch (err) {
    console.error("❌ DB Error in getApprovedRequestsFromModel:", err);
    throw err;
  }
};



module.exports = {
  createFormRequest,
  createRequestLog,
  getLogsByRequest,
  checkExistingRegularRequest,
  getMyRequestsFromModel,
  checkExistingTranscriptRequest,
  getSubmittedRequestsFromModel,
  getApprovedRequestsFromModel,
};
