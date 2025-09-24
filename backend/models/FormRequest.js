const db = require("../config/db");

// ✅ Create new form request
const createFormRequest = async (studentId, formType, semNum, examType) => {
  const [result] = await db.execute(
    `INSERT INTO form_requests 
      (student_id, form_type, sem_num, exam_type, request_date) 
     VALUES (?, ?, ?, ?, NOW())`,
    [studentId, formType, semNum, examType]
  );
  return result.insertId;
};

// ✅ Initial log when student submits
const createRequestLog = async (requestId, status, updatedBy) => {
  await db.execute(
    `INSERT INTO request_logs (request_id, status, updated_by, updated_at) 
     VALUES (?, ?, ?, NOW())`,
    [requestId, status, updatedBy]
  );
};

// ✅ Fetch student requests
const getRequestsByStudent = async (studentId) => {
  const [rows] = await db.query(
    `SELECT * FROM form_requests 
     WHERE student_id = ? 
     ORDER BY request_date DESC`,
    [studentId]
  );
  return rows;
};

// ✅ Get logs for a request
const getLogsByRequest = async (requestId) => {
  const [logs] = await db.query(
    `SELECT rl.id, rl.status, rl.updated_by, rl.updated_at
     FROM request_logs rl
     WHERE rl.request_id = ?
     ORDER BY rl.updated_at ASC`,
    [requestId]
  );

  const [request] = await db.query(
    `SELECT form_type FROM form_requests WHERE id = ?`,
    [requestId]
  );

  return { form_type: request[0]?.form_type || null, logs };
};

// ✅ Check if Regular already applied for this semester
const checkExistingRegularRequest = async (studentId, semNum) => {
  const [rows] = await db.query(
    `SELECT * FROM form_requests 
     WHERE student_id = ? 
       AND sem_num = ? 
       AND exam_type = 'Regular'`,
    [studentId, semNum]
  );
  return rows.length > 0;
};


module.exports = { 
  createFormRequest, 
  createRequestLog, 
  getRequestsByStudent, 
  getLogsByRequest,
  checkExistingRegularRequest
};
