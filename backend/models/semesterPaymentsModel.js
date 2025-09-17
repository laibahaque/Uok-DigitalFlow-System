const db = require("../config/db");

const getPaymentsByDepartment = async (departmentName) => {
  const [rows] = await db.query(
    `SELECT 
        sp.student_id, 
        s.name AS student_name, 
        s.seat_no, 
        s.program, 
        d.depart_name, 
        sp.sem_no, 
        sp.payment_status 
     FROM semester_payments sp
     JOIN students s ON sp.student_id = s.id
     JOIN departments_sci d ON s.depart_id = d.id
     WHERE LOWER(d.depart_name) = LOWER(?)`,
    [departmentName]
  );
  return rows;
};
module.exports = { getPaymentsByDepartment };


