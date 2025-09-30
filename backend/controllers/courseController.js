const { getCoursesByStudentAndSemester } = require("../models/Courses");

const fetchCourses = async (req, res) => {
  try {
    const { studentId, semester } = req.params;
    const courses = await getCoursesByStudentAndSemester(studentId, semester);
    res.json(courses);
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({ message: "Error fetching courses" });
  }
};

module.exports = { fetchCourses };
