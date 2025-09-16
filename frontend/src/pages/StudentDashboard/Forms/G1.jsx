import React, { useState } from "react";

export default function G1Form() {
  const [formData, setFormData] = useState({
    serials: [],
    departmentFrom: "",
    departmentTo: "",
    courseNumbers: "",
    name: "",
    fatherName: "",
    seatNo: "",
    department: "",
    remarks: "",
  });

  const serialOptions = [
    "Change the subject (major/minor) from one department to another",
    "Payment of short of attendance condonation fine Rs.350/- per course",
    "Attend fresh classes as failed for the 3rd time in each course",
    "Attend classes (short of attendance) with utilization fee",
    "Restoration of admission / continuation after gap",
    "Re-enrolment / extension of re-enrolment",
    "Special condensed classes (failed 3rd time in one course) Rs.5,000 fine",
    "Change of subject(s) fine without Dean permission",
    "National duty attendance exemption (Olympics, Haj, etc.)",
    "Undertaking for conversion from Honours to Pass",
    "Permission for Thesis / Project at departmental level",
    "Change of Compulsory Urdu to other subject",
    "One-Time Special Examination permission",
    "Permission as Repeater / Improvement course",
    "Cancellation of attempted course as improvement",
    "Restoration of previous marks after improvement",
    "Name not in Seat List – Seat allocation required",
    "Proforma not received as repeater / regular semester",
    "Correction in Marks Sheet / Proforma",
    "Other permission (please specify)",
  ];

  const handleCheckboxChange = (index) => {
    setFormData((prev) => {
      const newSerials = prev.serials.includes(index)
        ? prev.serials.filter((i) => i !== index)
        : [...prev.serials, index];
      return { ...prev, serials: newSerials };
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    alert("Form submitted! Check console for data.");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6">University of Karachi - Form G-1</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Serial Selection */}
        <div>
          <h2 className="font-semibold mb-2">Select Relevant Serial(s)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border p-3 rounded">
            {serialOptions.map((option, idx) => (
              <label key={idx} className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={formData.serials.includes(idx)}
                  onChange={() => handleCheckboxChange(idx)}
                  className="mt-1"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Department Change Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="departmentFrom"
            value={formData.departmentFrom}
            onChange={handleChange}
            placeholder="From Department"
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            name="departmentTo"
            value={formData.departmentTo}
            onChange={handleChange}
            placeholder="To Department"
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Student Name"
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            placeholder="Father's Name"
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            name="seatNo"
            value={formData.seatNo}
            onChange={handleChange}
            placeholder="Seat Number"
            className="border p-2 rounded w-full"
          />
        </div>

        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="Department"
          className="border p-2 rounded w-full"
        />

        {/* Remarks */}
        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Remarks / Other Details"
          className="border p-2 rounded w-full"
          rows="3"
        ></textarea>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Submit Form
        </button>
      </form>
    </div>
  );
}
