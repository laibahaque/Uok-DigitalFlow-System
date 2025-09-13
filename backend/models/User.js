const db = require("../config/db");

const createUser = async (studentId, email, hashedPassword) => {
  return db.execute(
    "INSERT INTO users (student_id, email, password, created_at) VALUES (?, ?, ?, NOW())",
    [studentId, email, hashedPassword]
  );
};

const findByEmail = async (email, table = "users") => {
  const [rows] = await db.execute(`SELECT * FROM ${table} WHERE email = ?`, [email]);
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await db.query(`SELECT id, role FROM users WHERE id = ?`, [id]);
  return rows[0];
};

const updatePassword = async (id, hashedPassword) => {
  return db.query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, id]);
};

const getPassword = async (id) => {
  const [rows] = await db.query(`SELECT password FROM users WHERE id = ?`, [id]);
  return rows[0]?.password;
};

module.exports = { createUser, findByEmail, findById, updatePassword, getPassword };
