// controllers/authController.js
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { findBySeatAndDepartment, updateStudentUserId } = require("../models/Student");
const { createUser, findByEmail } = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/password");

// 📌 Register
const registerUser = async (req, res) => {
  const { seatNumber, email, department, password } = req.body;

  // console.log("📥 Incoming Registration Request:", { seatNumber, email, department });

  if (!seatNumber || !email || !department || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const student = await findBySeatAndDepartment(seatNumber, department);
    // console.log("📌 Student Found:", student);

    if (!student) {
      return res.status(400).json({ message: "Invalid seat number or department" });
    }

    if (student.user_id) {
      // console.log("⚠️ Student already linked with user_id:", student.user_id);
      return res.status(400).json({ message: "Account already exists for this student" });
    }

    const existingUser = await findByEmail(email);
    if (existingUser) {
      // console.log("⚠️ Email already exists in users table:", existingUser);
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await hashPassword(password);
    // console.log("🔑 Hashed Password Generated");

    const newUserId = await createUser(email, hashedPassword, 3); // role_id = 3 → student
    // console.log("✅ New User Created with ID:", newUserId);

    await updateStudentUserId(student.id, newUserId);
    // console.log(`🔗 Student ID ${student.id} linked with User ID ${newUserId}`);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Error in registerUser:", err);
    res.status(500).json({ message: "Error registering user" });
  }
};

// 📌 Login
const loginUser = async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    const user = await findByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await comparePassword(password, user.password || "");
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // fetch role
    const [roleRows] = await db.query(`SELECT slug, name FROM roles WHERE id = ?`, [user.role_id]);
    const roleSlug = roleRows[0]?.slug; // "student", "faculty-admin", "university-admin"
    const roleName = roleRows[0]?.name;

    if (!roleSlug) return res.status(400).json({ message: "User role not found" });

    // ✅ Restrict login tab
    if (userType === "student" && roleSlug !== "student") {
      return res.status(403).json({ message: "Please login through Admin tab" });
    }
    if (userType === "admin" && roleSlug === "student") {
      return res.status(403).json({ message: "Please login through Student tab" });
    }

    const payload = { id: user.id, role: roleSlug, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({
      message: "Login successful",
      token,
      userId: user.id,
      roleSlug,   // "student" | "faculty-admin" | "university-admin"
      roleName,   // Friendly name
      userType,   // "student" | "admin"
    });
  } catch (err) {
    console.error("❌ Error in loginUser:", err);
    res.status(500).json({ message: "Error logging in" });
  }
};

module.exports = { registerUser, loginUser };
