const { getPaymentsByDepartment } = require("../models/semesterPaymentsModel");

const fetchPaymentsByDepartment = async (req, res) => {
  try {
    const departmentName = decodeURIComponent(req.params.departmentName);
    const payments = await getPaymentsByDepartment(departmentName);
    res.status(200).json(payments.length ? payments : []); // 404 mat do
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching payments" });
  }
};
module.exports = { fetchPaymentsByDepartment };
