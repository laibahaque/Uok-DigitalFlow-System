const db = require("../config/db");

// Attendance fetch by department
const getAttendanceByDepartment = async (departmentName) => {
  try {
    console.log("Department Name:", departmentName);

    const [rows] = await db.query(
      `SELECT c.course_code, c.course_name, c.sem_no, 
              s.name AS student_name, s.seat_no, s.program, 
              a.percentage, d.depart_name 
       FROM attendence a   -- ✅ spelling check
       JOIN students s ON a.student_id = s.id 
       JOIN courses c ON a.course_id = c.id 
       JOIN departments_sci d ON s.depart_id = d.id 
       WHERE LOWER(d.depart_name) = LOWER(?)`,
      [departmentName]
    );

    return rows;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};


module.exports = { getAttendanceByDepartment };
