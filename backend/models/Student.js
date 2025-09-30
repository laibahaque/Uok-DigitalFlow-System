const db = require("../config/db");

// ✅ Register-time: seat + department
const findBySeatAndDepartment = async (seatNumber, department) => {
  // console.log("🔎 Running query for seat:", seatNumber, "department:", department);

  const [rows] = await db.query(
    `SELECT * FROM students 
     WHERE seat_no = ? 
     AND depart_id = (SELECT id FROM departments_sci WHERE depart_name = ?)`,
    [seatNumber, department]
  );

  // console.log("📌 Query Result:", rows);
  return rows[0];
};


// ✅ Login ke baad: by userId (FK in students table)
const getStudentProfileByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT 
        s.id AS student_id,
        s.user_id,
        s.seat_no,
        s.name,
        s.program,
        s.current_sem_no,
        d.depart_name
     FROM students s
     JOIN departments_sci d ON s.depart_id = d.id
     WHERE s.user_id = ?`,
    [userId]
  );
  return rows[0];
};

// ✅ Agar kahin studentId se fetch karna ho
const getStudentProfileByStudentId = async (studentId) => {
  const [rows] = await db.query(
    `SELECT s.seat_no, s.name, s.program, s.current_sem_no, d.depart_name
     FROM students s
     JOIN departments_sci d ON s.depart_id = d.id
     WHERE s.id = ?`,
    [studentId]
  );
  return rows[0];
};

// ✅ Register ke baad student-user link
const updateStudentUserId = async (studentId, userId) => {
  console.log(`📌 Running updateStudentUserId → studentId: ${studentId}, userId: ${userId}`);
  return db.execute(`UPDATE students SET user_id = ? WHERE id = ?`, [userId, studentId]);
};

module.exports = {
  findBySeatAndDepartment,
  getStudentProfileByUserId,
  getStudentProfileByStudentId,
  updateStudentUserId,
};
