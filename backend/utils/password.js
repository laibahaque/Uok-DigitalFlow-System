const bcrypt = require("bcryptjs");

// Hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Compare password
const comparePassword = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};

module.exports = { hashPassword, comparePassword };
