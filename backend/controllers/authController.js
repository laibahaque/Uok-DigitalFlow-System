// backend/controllers/authController.js
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { seatNumber, email, department, password } = req.body;

  if (!seatNumber || !email || !department || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [rows] = await db.query(
      `SELECT * FROM students WHERE seat_no = ? 
       AND depart_id = (SELECT id FROM departments_sci WHERE depart_name = ?)`,
      [seatNumber, department]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid seat number or department" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const studentId = rows[0].id;

    await db.execute(
      "INSERT INTO users (student_id, email, password, created_at) VALUES (?, ?, ?, NOW())",
      [studentId, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error in registerUser:", err);
    res.status(500).json({ message: "Error registering user" });
  }
};

const loginUser = async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    let query = "";
    if (userType === "student") {
      query = "SELECT * FROM users WHERE email = ?";
    } else if (userType === "admin") {
      query = "SELECT * FROM admin WHERE email = ?";
    } else {
      return res.status(400).json({ message: "Invalid user type" });
    }

    const [rows] = await db.execute(query, [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, role: userType }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful",
      token,
      userId: user.id,
      userType,
      title: user.title // Faculty ya University
    });

  } catch (err) {
    console.error("Error in loginUser:", err);
    res.status(500).json({ message: "Error logging in" });
  }
};

module.exports = { registerUser, loginUser };
