// 📂 src/components/G1Form.jsx
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";

export default function G1Form({ userId, studentInfo, selectedForm }) {
  // -------------------- States --------------------
  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    seatNo: "",
    department: "",
    semesters: [],
    courses: [{ code: "", name: "" }],
  });

  const [maxSemester, setMaxSemester] = useState(0);
  const [errors, setErrors] = useState({});
  const [voucherGenerated, setVoucherGenerated] = useState(false);
  const [paidSlip, setPaidSlip] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);

  const courseFee = 1500;
  const maxCourses = 3;

  // -------------------- Hooks --------------------
  useEffect(() => {
    setSubmitEnabled(voucherGenerated && paidSlip !== null);
  }, [voucherGenerated, paidSlip]);

  // populate student info
  useEffect(() => {
    if (studentInfo) {
      setForm((prev) => ({
        ...prev,
        name: studentInfo.full_name || "",
        fatherName: studentInfo.father_name || "",
        seatNo: studentInfo.seat_number || "",
        department: studentInfo.department || "",
      }));
      setMaxSemester(studentInfo.current_sem_no || 0);
    }
  }, [studentInfo]);

  // -------------------- Handlers --------------------
  const updateField = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSemesterChange = async (sem) => {
    let updated = [...form.semesters];
    if (updated.includes(sem)) {
      updated = updated.filter((s) => s !== sem);
    } else {
      updated.push(sem);
    }
    updateField("semesters", updated);

    if (!updated.includes(sem)) return; // skip if unchecked
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${userId}/${sem}`);
      const data = await res.json();
      setAvailableCourses(data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  const handleCourseChange = (index, field, value) => {
    const updatedCourses = [...form.courses];
    updatedCourses[index][field] = value;
    setForm((prev) => ({ ...prev, courses: updatedCourses }));
  };

  const addCourse = () => {
    if (form.courses.length < maxCourses) {
      setForm((prev) => ({
        ...prev,
        courses: [...prev.courses, { id: "", code: "", name: "" }],
      }));
    } else {
      alert("⚠️ Max 3 courses allowed.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !["image/jpeg", "image/jpg"].includes(file.type)) {
      setErrorMessage("⚠️ Only JPG/JPEG format allowed");
      setPaidSlip(null);
      return;
    }
    setErrorMessage("");
    setPaidSlip(file);
  };

  // -------------------- Validation --------------------
  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Student name required";
    if (!form.seatNo) newErrors.seatNo = "Seat no required";
    if (!form.department) newErrors.department = "Department required";
    if (!form.semesters.length) newErrors.semesters = "Select at least one semester";
    if (!form.courses.length) newErrors.courses = "Add at least one course";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------- Voucher --------------------
  const generateVoucher = async () => {
    if (!validateForm()) return;

    try {
      const res = await fetch("http://localhost:5000/api/requests/check-duplicate-g1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          sem_num: form.semesters[0],
          courses: JSON.stringify(form.courses), // ✅
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.message || "Duplicate request found");
        return; // 🔴 voucher nahi banega
      }
    } catch (err) {
      setErrorMessage("Server error while checking duplicate");
      return;
    }

    const totalFee = form.courses.length * courseFee;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("University of Karachi - G1 Voucher", 20, 20);
    doc.setFontSize(12);
    doc.text(`Student Name: ${form.name}`, 20, 40);
    doc.text(`Seat No: ${form.seatNo}`, 20, 50);
    doc.text(`Department: ${form.department}`, 20, 60);
    doc.text(`Semesters: ${form.semesters.join(", ")}`, 20, 70);
    form.courses.forEach((c, i) =>
      doc.text(`Course ${i + 1}: ${c.code} - ${c.name}`, 20, 80 + i * 10)
    );
    doc.text(`Total Fee: Rs. ${totalFee}`, 20, 120);
    doc.save("G1Voucher.pdf");

    setVoucherGenerated(true);
    alert("✅ Voucher generated! Now upload slip & submit form.");
  };

  // -------------------- Submit --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!paidSlip) {
      setErrorMessage("Please upload paid slip first");
      return;
    }


    try {
      const res = await fetch("http://localhost:5000/api/requests/g1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          form_type: selectedForm,
          sem_num: form.semesters[0], // ✅ ek semester select hua hoga to uska number bhejo
          courses: JSON.stringify(form.courses), // ✅ pura array bhejna hai (id, code, name)
        }),

      });


      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${selectedForm} submitted successfully`);
        window.location.href = "/dashboard";
      } else {
        setErrorMessage(data.message || "Submission failed");
      }
    } catch (err) {
      console.error("Error submitting G1:", err);
      setErrorMessage("Server error while submitting form");
    }
  };

  // -------------------- Styles --------------------
  const inputClass =
    "w-full border border-gray-300 rounded-md px-4 py-2 text-base focus:ring-2 focus:ring-blue-400 focus:outline-none";
  const errorClass = "text-red-600 text-sm mt-1";

  // -------------------- JSX --------------------
  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold tracking-wide text-blue-700 uppercase">
          University Of Karachi
        </h1>
        <p className="text-red-600 text-base mt-1">Application for Form G-1</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto bg-white/90 shadow-md rounded p-8 space-y-6"
      >
        {/* Student Info */}
        <section>
          <h2 className="text-lg font-semibold text-blue-700 border-b pb-2 mb-4">
            Student Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Name</label>
              <input
                value={form.name}
                readOnly
                className="bg-blue-100 cursor-not-allowed w-full px-2 py-2 rounded border-none focus:outline-none"
              />
              {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>
            <div>
              <label>Father's Name</label>
              <input
                value={form.fatherName}
                onChange={(e) => updateField("fatherName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label>Seat No</label>
              <input
                value={form.seatNo}
                readOnly
                className="bg-blue-100 cursor-not-allowed w-full px-2 py-2 rounded border-none focus:outline-none"
              />
              {errors.seatNo && <p className={errorClass}>{errors.seatNo}</p>}
            </div>
            <div>
              <label>Department</label>
              <input
                value={form.department}
                readOnly
                className="bg-blue-100 cursor-not-allowed w-full px-2 py-2 rounded border-none focus:outline-none"
              />
              {errors.department && <p className={errorClass}>{errors.department}</p>}
            </div>
          </div>
        </section>

        {/* Semester Selection */}
        <section>
          <h2 className="text-lg font-semibold text-blue-700 border-b pb-2 mb-4">
            Semester Selection
          </h2>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: maxSemester }, (_, i) => (
              <label key={i} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.semesters.includes(i + 1)}
                  onChange={() => handleSemesterChange(i + 1)}
                />
                <span>Semester {i + 1}</span>
              </label>
            ))}
          </div>
          {errors.semesters && <p className={errorClass}>{errors.semesters}</p>}
        </section>

        {/* Courses */}
        <section>
          <h2 className="text-lg font-semibold text-blue-700 border-b pb-2 mb-4">
            Courses
          </h2>

          {form.courses.map((c, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-4 mb-2">
              <select
                value={c.code}
                onChange={(e) => {
                  const selected = availableCourses.find(
                    (course) => course.course_code === e.target.value
                  );
                  if (selected) {
                    handleCourseChange(idx, "code", selected.course_code);
                    handleCourseChange(idx, "name", selected.course_name);
                    handleCourseChange(idx, "id", selected.id);  // ✅ course_id add
                  }
                }}
                className={inputClass}
              >
                <option value="">Select Course</option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.course_code}>
                    {course.course_code} - {course.course_name}
                  </option>
                ))}
              </select>


              <input
                type="text"
                value={c.name}
                readOnly
                className="bg-blue-100 cursor-not-allowed w-full px-2 py-2 rounded border-none focus:outline-none"
              />
            </div>
          ))}

          {form.courses.length < maxCourses && (
            <button
              type="button"
              onClick={addCourse}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Add Course
            </button>
          )}
          {errors.courses && <p className={errorClass}>{errors.courses}</p>}
        </section>

        {/* Paid Slip Upload */}
        {voucherGenerated && (
          <section>
            <h2 className="text-lg font-semibold text-blue-700 border-b pb-2 mb-4">
              Upload Paid Slip
            </h2>
            <input
              type="file"
              accept=".jpg,.jpeg"
              onChange={handleFileChange}
              className={inputClass}
            />
          </section>
        )}

        {errorMessage && (
          <p className="text-center text-red-600 font-medium">{errorMessage}</p>
        )}

        {/* Buttons */}
        <div className="text-center space-x-4">
          <button
            type="submit"
            disabled={!submitEnabled}
            className={`px-6 py-2 rounded shadow-md ${submitEnabled
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
          >
            Submit Form
          </button>

          <button
            type="button"
            onClick={generateVoucher}
            disabled={voucherGenerated}
            className={`px-6 py-2 rounded shadow-md ${voucherGenerated
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
              }`}
          >
            Generate Voucher
          </button>
        </div>
      </form>
    </div>
  );
}
