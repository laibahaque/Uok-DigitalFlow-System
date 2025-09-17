const db = require("../config/db");

const getResultsByDepartment = async (departmentName) => {
  const [rows] = await db.query(
    `
      SELECT 
        sr.student_id,
        s.name AS student_name,
        s.seat_no,
        s.program,
        d.depart_name,
        sr.sem_no,
        sr.result_status
      FROM semester_results sr
      JOIN students s ON sr.student_id = s.id
      JOIN departments_sci d ON s.depart_id = d.id
      WHERE LOWER(d.depart_name) = LOWER(?)
    `,
    [departmentName]
  );

  return rows;
};

module.exports = { getResultsByDepartment };
