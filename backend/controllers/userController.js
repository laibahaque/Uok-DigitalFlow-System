const db = require("../config/db");

const getStudentInfo = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT s.name 
       FROM users u 
       JOIN students s ON u.student_id = s.id 
       WHERE u.id = ?`,
      [id]
    );


    if (rows.length === 0) {
      console.log("⚠️ Student not found for user.id =", id);
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ name: rows[0].name });
  } catch (error) {
    console.error("❌ Error in getStudentInfo:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// 👨‍💻 Get Admin Info (agar chahiye to yeh simple rakho)
const getAdminInfo = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT id, role FROM users WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching admin info:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getStudentInfo, getAdminInfo };
