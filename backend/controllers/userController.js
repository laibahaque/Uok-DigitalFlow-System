const {
  getStudentProfileByUserId,
} = require("../models/Student");
const {
  findById,
  getPassword,
  updatePassword,getAdminById,
} = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/password");

// 📌 Student Info
const getStudentInfo = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied. Not a student." });
    }

    const student = await getStudentProfileByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    res.json({
      full_name: student.name,
      seat_number: student.seat_no,
      program: student.program,
      department: student.depart_name,
      current_sem_no: student.current_sem_no,
    });
  } catch (err) {
    console.error("❌ Error in getStudentInfo:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Admin Info
const getAdminInfo = async (req, res) => {
  try {
    if (req.user.role !== "faculty-admin" && req.user.role !== "university-admin") {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    const admin = await getAdminById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      id: admin.id,
      email: admin.email,
      role_name: admin.role_name
    });
  } catch (err) {
    console.error("❌ Error fetching admin info:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// 📌 Change Password (sirf student)
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can change password" });
    }

    const currentHash = await getPassword(req.user.id);
    if (!currentHash) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await comparePassword(oldPassword, currentHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const newHash = await hashPassword(newPassword);
    await updatePassword(req.user.id, newHash);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error in changePassword:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getStudentInfo, getAdminInfo, changePassword };
