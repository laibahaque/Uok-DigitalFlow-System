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

const getStudentProfile = async (userId) => {
  const [rows] = await db.query(
    `SELECT 
       s.seat_no, 
       s.name, 
       s.program, 
       s.current_sem_no,
       d.depart_name
     FROM users u
     JOIN students s ON u.student_id = s.id
     JOIN departments_sci d ON s.depart_id = d.id
     WHERE u.id = ?`,  
    [userId]
  );
  console.log("👉 Query Result:", rows); 
  return rows[0];
};

module.exports = { findBySeatAndDepartment, getStudentProfile };
