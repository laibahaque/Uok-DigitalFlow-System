const db = require("../config/db");

const createUser = async (email, hashedPassword, roleId = 3) => {
  const [result] = await db.execute(
    `INSERT INTO users (role_id, email, password, created_at, updated_at) 
     VALUES (?, ?, ?, NOW(), NOW())`,
    [roleId, email, hashedPassword]
  );
  return result.insertId; // return new user id
};

const findByEmail = async (email) => {
  const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email]);
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await db.query(`SELECT id, role_id FROM users WHERE id = ?`, [id]);
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
