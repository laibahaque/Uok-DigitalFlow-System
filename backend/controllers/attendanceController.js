const { getAttendanceByDepartment } = require("../models/Attendance");

const fetchAttendance = async (req, res) => {
  const { departmentName } = req.params; // e.g., "Computer Science"
  // console.log("📌 Department requested:", departmentName);

  try {
    const data = await getAttendanceByDepartment(departmentName);
    // console.log("📌 Query result:", data);

    if (!data.length) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Error in fetchAttendance:", err);
    res.status(500).json({ message: "Error fetching attendance data" });
  }
};

module.exports = { fetchAttendance };
