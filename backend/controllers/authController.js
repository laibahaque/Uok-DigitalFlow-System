const jwt = require("jsonwebtoken");
const { findBySeatAndDepartment } = require("../models/Student");
const { createUser, findByEmail } = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/password");

// 📌 Register Student
const registerUser = async (req, res) => {
  const { seatNumber, email, department, password } = req.body;

  if (!seatNumber || !email || !department || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Student validate karo
    const student = await findBySeatAndDepartment(seatNumber, department);
    if (!student) {
      return res.status(400).json({ message: "Invalid seat number or department" });
    }

    const hashedPassword = await hashPassword(password);

    await createUser(student.id, email, hashedPassword);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Error in registerUser:", err);
    res.status(500).json({ message: "Error registering user" });
  }
};

// 📌 Login (Student + Admin)
const loginUser = async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    let table = "";
    if (userType === "student") {
      table = "users";
    } else if (userType === "admin") {
      table = "admin";
    } else {
      return res.status(400).json({ message: "Invalid user type" });
    }

    const user = await findByEmail(email, table);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await comparePassword(password, user.password || "");
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in .env");
      return res.status(500).json({ message: "Server config error" });
    }

    // Token payload fix
    const payload = {
      id: user.id,
      role: userType,            // "student" or "admin"
      title: user.title || null, // Faculty / University (for admin only)
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Login successful",
      token,
      userId: user.id,
      userType,
      title: user.title || null,
    });
  } catch (err) {
    console.error("❌ Error in loginUser:", err);
    res.status(500).json({ message: "Error logging in" });
  }
};

module.exports = { registerUser, loginUser };