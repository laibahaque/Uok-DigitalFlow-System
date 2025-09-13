const { getStudentProfile } = require("../models/Student");
const { findById, getPassword, updatePassword } = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/password");

// 📌 Student Profile
const getStudentInfo = async (req, res) => {
  try {
    const student = await getStudentProfile(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
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
    const admin = await findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json(admin);
  } catch (err) {
    console.error("❌ Error fetching admin info:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Change Password
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const currentHash = await getPassword(req.params.id);
    if (!currentHash) return res.status(404).json({ message: "User not found" });

    const isMatch = await comparePassword(oldPassword, currentHash);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    const newHash = await hashPassword(newPassword);
    await updatePassword(req.params.id, newHash);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error in changePassword:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getStudentInfo, getAdminInfo, changePassword };
