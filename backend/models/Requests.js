const db = require("../config/db");

// 🔎 1. Get Student ID by logged-in user’s id
const getStudentIdByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT id FROM students WHERE user_id = ?`,
    [userId]
  );
  return rows[0]?.id || null;
};

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
    `SELECT 
       r.form_type,
       r.sem_num,
       r.exam_type,
       r.course_id,
       c.course_code,
       c.course_name
     FROM requests r
     LEFT JOIN courses c ON r.course_id = c.id
     WHERE r.id = ?`,
    [requestId]
  );

  return {
    form_type: reqRow[0]?.form_type || "",
    sem_num: reqRow[0]?.sem_num || null,
    exam_type: reqRow[0]?.exam_type || null,
    course_code: reqRow[0]?.course_code || null,
    course_name: reqRow[0]?.course_name || null,
    logs,
  };
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
const checkExistingG1Request = async (loggedInUserId, semNum, courseId) => {
  const studentId = await getStudentIdByUserId(loggedInUserId);
  if (!studentId) return false;

  const [rows] = await db.execute(
    `SELECT id FROM requests
       WHERE student_id = ? 
         AND sem_num = ? 
         AND course_id = ? 
         AND form_type = 'G1 Form'`,
    [studentId, semNum, courseId]
  );

  return rows.length > 0;
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
      LEFT JOIN courses c ON r.course_id = c.id
      ORDER BY r.created_at DESC
    `);

    return rows;
  } catch (err) {
    console.error("❌ DB Error in getSubmittedRequestsFromModel:", err);
    throw err;
  }
};

const getApprovedRequestsFromModel = async () => {
  try {
    const [rows] = await db.execute(`
      SELECT 
          r.id AS request_id,
          r.form_type,
          r.sem_num,
          r.exam_type,
          c.course_code,
          c.course_name,
          r.status AS request_status,
          r.created_at,
          s.seat_no,
          s.program,
          d.depart_name AS department_name
      FROM requests r
      JOIN students s ON r.student_id = s.id
      JOIN departments_sci d ON s.depart_id = d.id
      LEFT JOIN courses c ON r.course_id = c.id
      WHERE r.status = 'Faculty Approved'
      ORDER BY r.created_at DESC
    `);

    return rows;
  } catch (err) {
    console.error("❌ DB Error in getApprovedRequestsFromModel:", err);
    throw err;
  }
};

// 📌 Update Request Status (Faculty Admin Accept/Reject)
const updateRequestStatusInModel = async (requestId, status) => {
  let finalStatus = status;

  // 🔥 Special Case: If G1 Form and Faculty Approves → Move to "In Progress"
  if (status === "Faculty Approved") {
    const [formRow] = await db.execute(
      `SELECT form_type FROM requests WHERE id = ?`,
      [requestId]
    );

    // formType check
    if (formRow.length > 0 && formRow[0].form_type === "G1 Form") {
      finalStatus = "In Progress";
    }
  }

  const [result] = await db.execute(
    `UPDATE requests SET status = ?, updated_at=NOW() WHERE id = ?`,
    [finalStatus, requestId]
  );

  return result;
};

// 📌 Get single request by ID
const getRequestById = async (requestId) => {
  const [rows] = await db.execute(
    `SELECT id, student_id, form_type, sem_num
       FROM requests
      WHERE id = ?`,
    [requestId]
  );
  return rows[0] || null;
};

// Request details with student user_id
const getRequestByIdWithStudent = async (requestId) => {
  const [rows] = await db.execute(
    `SELECT r.id, r.form_type, r.sem_num, r.student_id, s.user_id AS student_user_id
       FROM requests r
       JOIN students s ON r.student_id = s.id
      WHERE r.id = ?`,
    [requestId]
  );
  return rows[0] || null;
};

// Uni Admin user fetch (role_id = 2)
const getUniAdminUser = async () => {
  const [rows] = await db.execute(
    `SELECT id, email FROM users WHERE role_id = 2 LIMIT 1`
  );
  return rows[0] || null;
};
const getFacultyAdminUser = async () => {
  const [rows] = await db.execute(
    `SELECT id, email FROM users WHERE role_id = 1 LIMIT 1`
  );
  return rows[0] || null;
};
const autoCompleteOldRequests = async () => {
  try {
    // 1) fetch candidate rows for logging/debugging (optional but helpful)
    const [candidates] = await db.query(`
      SELECT id, student_id, form_type, sem_num, updated_at
      FROM requests
      WHERE status = 'In Progress'
        AND updated_at <= NOW() - INTERVAL 5 MINUTE
    `);

    console.log(`[autoComplete] candidates found: ${candidates.length}`);
    candidates.forEach(c => console.log(`  id=${c.id}, updated_at=${c.updated_at}`));

    for (const r of candidates) {
      // 2) Do an atomic update: update only if still In Progress AND still older than 5 minutes
      const [updateResult] = await db.query(
        `UPDATE requests
         SET status = 'Completed', updated_at = NOW()
         WHERE id = ? 
           AND status = 'In Progress'
           AND updated_at <= NOW() - INTERVAL 5 MINUTE`,
        [r.id]
      );

      // If nobody updated (0 rows), skip creating logs/notifications
      if (updateResult.affectedRows === 0) {
        console.log(`[autoComplete] skipped id=${r.id} (condition not met at update time)`);
        continue;
      }

      console.log(`[autoComplete] completed id=${r.id}`);

      // 3) Insert completed log if not exists (safe to keep)
      const [logExists] = await db.query(
        `SELECT id FROM request_logs WHERE request_id = ? AND status = 'Completed'`,
        [r.id]
      );
      if (logExists.length === 0) {
        console.log(`[autoComplete] inserting log for request ${r.id} with updated_by = NULL`);
        await db.query(
          `INSERT INTO request_logs (request_id, status, updated_by, created_at)
           VALUES (?, 'Completed', NULL, NOW())`,
          [r.id]
        );
      }

      // 4) Notification
      await db.query(
        `INSERT INTO notifications (user_id, title, message)
         VALUES ((SELECT user_id FROM students WHERE id = ?), ?, ?)`,
        [
          r.student_id,
          "Request Completed ✅",
          `Your ${r.form_type} request (Semester ${r.sem_num || ""}) has been completed.`,
        ]
      );
    }

    return candidates.length;
  } catch (err) {
    console.error("❌ autoCompleteOldRequests error:", err);
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
  updateRequestStatusInModel,
  getRequestById,
  getRequestByIdWithStudent,
  getUniAdminUser,
  getFacultyAdminUser,
  checkExistingG1Request,
  autoCompleteOldRequests,
};