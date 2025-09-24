const db = require("../config/db");

const findBySeatAndDepartment = async (seatNumber, department) => {
  const [rows] = await db.query(
    `SELECT * FROM students 
     WHERE seat_no = ? 
     AND depart_id = (SELECT id FROM departments_sci WHERE depart_name = ?)`,
    [seatNumber, department]
  );
  return rows[0];
};

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


module.exports = { findBySeatAndDepartment, getStudentProfileByStudentId };
