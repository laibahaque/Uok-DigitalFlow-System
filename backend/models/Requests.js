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
const createFormRequest = async (loggedInUserId, formType, semNum = null, examType = null) => {
  const studentId = await getStudentIdByUserId(loggedInUserId);
  console.log("🔎 LoggedInUserId:", loggedInUserId);
  console.log("🔎 StudentId from DB:", studentId);

  if (!studentId) {
    throw new Error("❌ Student record not found for this user.");
  }

  // 🔥 Dynamic INSERT
  const [result] = await db.execute(
    `INSERT INTO requests 
       (student_id, form_type, sem_num, exam_type, status, updated_at, created_at)
     VALUES (?, ?, ?, ?, 'Submitted', NOW(), NOW())`,
    [
      studentId,
      formType,
      semNum || null,      // agar undefined/empty hai to null bhejna
      examType || null
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

module.exports = {
  createFormRequest,
  createRequestLog,
  getLogsByRequest,
  checkExistingRegularRequest,
  getMyRequestsFromModel,
  checkExistingTranscriptRequest,
};
