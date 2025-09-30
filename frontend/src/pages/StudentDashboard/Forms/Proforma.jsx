import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";

const Proforma = ({ userId, studentInfo, selectedForm }) => {
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
    examType: "",
  });

  const [maxSemester, setMaxSemester] = useState(0);
  const [errors, setErrors] = useState({});
  const [voucherGenerated, setVoucherGenerated] = useState(false);
  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  // Populate form with student info
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

  // Enable submit only if voucher generated and paid slip uploaded
  useEffect(() => {
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
    if (file && !["image/jpeg", "image/jpg"].includes(file.type)) {
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
    if (!form.semester.length) newErrors.semester = "Select at least one semester";
    if (!form.examType) newErrors.examType = "Please select exam type";
    if (!form.paidSlip) newErrors.paidSlip = "Upload paid slip image (JPG)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await fetch("http://localhost:5000/api/requests/proforma", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          form_type: selectedForm,
          sem_num: form.semester.join(","),
          exam_type: form.examType,
        }),
      });


      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${selectedForm} request submitted!`);
        window.location.href = "/dashboard";
      } else {
        alert("❌ Failed: " + data.message);
      }
    } catch (err) {
      console.error("Error submitting request:", err);
    }
  };

  const generateVoucher = async () => {
    setErrorMessage(""); // reset old error

    if (!form.fullname || !form.seatNo || !form.department || !form.semester.length) {
      alert("⚠️ Fill required fields and select semesters before generating voucher!");
      return;
    }

    try {
      // 🔎 Check backend se
      const res = await fetch("http://localhost:5000/api/requests/check-regular", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          sem_num: form.semester.join(","),
          exam_type: form.examType
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message ); // bas backend ka message show karega
        return; // voucher generate nahi hoga
      }


      // ✅ Voucher generate hoga agar koi issue nahi
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
      doc.text(`Exam Type: ${form.examType}`, 20, 90);
      doc.text(`Total Fee: Rs ${fee}`, 20, 100);
      doc.text("Please upload paid slip image after generating voucher.", 20, 110);
      doc.save("FeeVoucher.pdf");

      setVoucherGenerated(true);
      alert("✅ Voucher generated! Now upload your paid slip to enable submission.");

    } catch (err) {
      console.error("Voucher error:", err);
      setErrorMessage("Server error. Please try again.");
    }
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
        <p className="text-red-600 text-base mt-1">Application for Proforma</p>
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
                readOnly
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-base bg-blue-100 text-gray-700 cursor-not-allowed focus:outline-none"
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
                readOnly
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-base bg-blue-100 text-gray-700 cursor-not-allowed focus:outline-none"
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
                readOnly
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-base bg-blue-100 text-gray-700 cursor-not-allowed focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700">Department</label>
              <input
                type="text"
                value={form.department}
                readOnly
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-base bg-blue-100 text-gray-700 cursor-not-allowed focus:outline-none"
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

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 mb-1">Select Exam Type</label>
              <select
                value={form.examType}
                onChange={(e) => updateField("examType", e.target.value)}
                className={inputClass}
              >
                <option value="">-- Select --</option>
                <option value="Regular">Regular</option>
                <option value="Improved">Improved</option>
              </select>
              {errors.examType && <p className={errorClass}>{errors.examType}</p>}
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
        {errorMessage && (
          <div className="text-center text-red-600 font-medium mt-3">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        <div className="text-center space-x-4">
          <button
            type="submit"
            disabled={!submitEnabled}
            className={`font-medium px-6 py-2 rounded-lg shadow-md transition transform hover:scale-105 ${submitEnabled
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
            className={`font-medium px-6 py-2 rounded-lg shadow-md transition transform hover:scale-105 ${voucherGenerated
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
