const { getResultsByDepartment } = require("../models/Results");

const fetchResults = async (req, res) => {
  const { departmentName } = req.params;
  // console.log("📌 Results requested for:", departmentName);

  try {
    const data = await getResultsByDepartment(departmentName);
    // console.log("📌 Results query result:", data);

    if (!data.length) {
      return res.status(404).json({ message: "No results found" });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Error in fetchResults:", err);
    res.status(500).json({ message: "Error fetching results data" });
  }
};

module.exports = { fetchResults };
