const db = require("../config/db");

// ✅ Get courses by student & semester
const getCoursesByStudentAndSemester = async (studentId, semester) => {
  const [rows] = await db.execute(
    `SELECT id, course_code, course_name 
       FROM courses 
      WHERE student_id = ? AND sem_no = ?`,
    [studentId, semester]
  );
  return rows;
};

module.exports = { getCoursesByStudentAndSemester };
