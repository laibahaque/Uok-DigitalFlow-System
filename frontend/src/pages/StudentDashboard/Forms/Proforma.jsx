import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";

const Proforma = ({ userId, studentInfo }) => {
  const [form, setForm] = useState({
    fullname: "",
    fatherName: "",
    nameOfExamination: "",
    department: "",
    seatNo: "",
    enrollmentNo: "",
    program: "",
    semester: [],
    contactNo: "",
    paidSlip: null,
  });

  const [maxSemester, setMaxSemester] = useState(0);
  const [errors, setErrors] = useState({});
  const [voucherGenerated, setVoucherGenerated] = useState(false);
  const [submitEnabled, setSubmitEnabled] = useState(false);

  const updateField = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    if (studentInfo) {
      setForm((prev) => ({
        ...prev,
        fullname: studentInfo.full_name || "",
        seatNo: studentInfo.seat_number || "",
        program: studentInfo.program || "",
        department: studentInfo.department || "",
      }));
      setMaxSemester(studentInfo.current_sem_no || 0);
    }
  }, [studentInfo]);

  useEffect(() => {
    // Submit button active only if voucher generated AND paid slip uploaded
    setSubmitEnabled(voucherGenerated && form.paidSlip !== null);
  }, [voucherGenerated, form.paidSlip]);

  const handleCheckboxChange = (sem) => {
    let updated = [...form.semester];
    if (updated.includes(sem)) {
      updated = updated.filter((s) => s !== sem);
    } else {
      updated.push(sem);
    }
    updateField("semester", updated);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "image/jpeg" && file.type !== "image/jpg") {
      alert("⚠️ Only JPG format is allowed!");
      return;
    }
    updateField("paidSlip", file);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.fullname) newErrors.fullname = "Full name is required";
    if (!form.seatNo) newErrors.seatNo = "Seat number is required";
    if (!form.department) newErrors.department = "Department is required";
    if (!form.semester.length)
      newErrors.semester = "Select at least one semester";
    if (!form.paidSlip) newErrors.paidSlip = "Upload paid slip image (JPG)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const fee = form.semester.length * 60;
    const payload = {
      ...form,
      submittedAt: new Date().toISOString(),
      status: "Pending Department Approval",
      totalFee: fee,
    };

    console.log("Proforma submitted payload:", payload);
    alert("✅ Proforma submitted (check console). Replace with API call.");
  };

  const generateVoucher = () => {
    if (!form.fullname || !form.seatNo || !form.department || !form.semester.length) {
      alert("⚠️ Fill required fields and select semesters before generating voucher!");
      return;
    }

    const fee = form.semester.length * 60;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("University of Karachi - Fee Voucher", 20, 20);
    doc.setFontSize(12);
    doc.text(`Full Name: ${form.fullname}`, 20, 40);
    doc.text(`Seat No: ${form.seatNo}`, 20, 50);
    doc.text(`Department: ${form.department}`, 20, 60);
    doc.text(`Program: ${form.program}`, 20, 70);
    doc.text(`Semesters Selected: ${form.semester.join(", ")}`, 20, 80);
    doc.text(`Total Fee: Rs ${fee}`, 20, 90);
    doc.text(
      "Please upload paid slip image after generating voucher.",
      20,
      100
    );
    doc.save("FeeVoucher.pdf");

    setVoucherGenerated(true); // mark voucher as generated
    alert("✅ Voucher generated! Now upload your paid slip to enable submission.");
  };

  const inputClass =
    "w-full border border-gray-300 rounded-md px-4 py-2 text-base focus:ring-2 focus:ring-green-400 focus:outline-none";
  const errorClass = "text-red-600 text-sm mt-1";

  return (
    <div className="w-full bg-gradient-to-br from-green-50 to-white p-6">
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold tracking-wide text-green-700 uppercase">
          University Of Karachi
        </h1>
        <p className="text-red-600 text-base mt-1">
          Application for Proforma
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto bg-white/90 backdrop-blur-sm shadow-md rounded-l p-8 border border-green-100 space-y-6"
      >
        {/* Personal Info */}
        <section>
          <h2 className="text-lg font-semibold text-green-700 border-b pb-2 mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Full Name</label>
              <input
                type="text"
                value={form.fullname}
                onChange={(e) => updateField("fullname", e.target.value)}
                className={inputClass}
              />
              {errors.fullname && <p className={errorClass}>{errors.fullname}</p>}
            </div>
            <div>
              <label className="block text-gray-700">Father's Name</label>
              <input
                type="text"
                value={form.fatherName}
                onChange={(e) => updateField("fatherName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-gray-700">Seat No</label>
              <input
                type="text"
                value={form.seatNo}
                onChange={(e) => updateField("seatNo", e.target.value)}
                className={inputClass}
              />
              {errors.seatNo && <p className={errorClass}>{errors.seatNo}</p>}
            </div>
            <div>
              <label className="block text-gray-700">Enrollment No</label>
              <input
                type="text"
                value={form.enrollmentNo}
                onChange={(e) => updateField("enrollmentNo", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Exam Info */}
        <section>
          <h2 className="text-lg font-semibold text-green-700 border-b pb-2 mb-4">
            Examination Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Program</label>
              <input
                type="text"
                value={form.program}
                onChange={(e) => updateField("program", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-gray-700">Department</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => updateField("department", e.target.value)}
                className={inputClass}
              />
              {errors.department && <p className={errorClass}>{errors.department}</p>}
            </div>
            <div>
              <label className="block text-gray-700">Name of Examination</label>
              <input
                type="text"
                value={form.nameOfExamination}
                onChange={(e) => updateField("nameOfExamination", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Semester (Select Multiple)</label>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: maxSemester }, (_, i) => (
                  <label key={i} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={form.semester.includes(i + 1)}
                      onChange={() => handleCheckboxChange(i + 1)}
                      className="w-4 h-4"
                    />
                    <span>Semester {i + 1}</span>
                  </label>
                ))}
              </div>
              {errors.semester && <p className={errorClass}>{errors.semester}</p>}
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section>
          <h2 className="text-lg font-semibold text-green-700 border-b pb-2 mb-4">
            Contact Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Contact No</label>
              <input
                type="text"
                value={form.contactNo}
                onChange={(e) => updateField("contactNo", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Paid Slip Upload */}
        {voucherGenerated && (
          <section>
            <h2 className="text-lg font-semibold text-green-700 border-b pb-2 mb-4">
              Upload Paid Slip
            </h2>
            <input
              type="file"
              accept=".jpg,.jpeg"
              onChange={handleFileChange}
              className={inputClass}
            />
            {errors.paidSlip && <p className={errorClass}>{errors.paidSlip}</p>}
          </section>
        )}

        {/* Actions */}
        <div className="text-center space-x-4">
          <button
            type="submit"
            disabled={!submitEnabled}
            className={`font-medium px-6 py-2 rounded-lg shadow-md transition transform hover:scale-105 ${
              submitEnabled
                ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            Submit Proforma
          </button>
          <button
            type="button"
            onClick={generateVoucher}
            disabled={voucherGenerated}
            className={`font-medium px-6 py-2 rounded-lg shadow-md transition transform hover:scale-105 ${
              voucherGenerated
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
            }`}
          >
            Generate Voucher
          </button>
        </div>
      </form>
    </div>
  );
};

export default Proforma;
