import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react"; // icon for search

const Attendance = ({ departmentName }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [programFilter, setProgramFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [seatNoSearch, setSeatNoSearch] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/attendance/${departmentName}`
        );
        setData(res.data);
      } catch (err) {
        console.error("❌ Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [departmentName]);

  if (loading) return <p>Loading attendance...</p>;

  // Unique programs for dropdown
  const uniquePrograms = [...new Set(data.map((row) => row.program))];

  // Apply filters
  const filteredData = data.filter((row) => {
    const matchesProgram = programFilter ? row.program === programFilter : true;
    const matchesSemester = semesterFilter
      ? row.sem_no === parseInt(semesterFilter)
      : true;

    const matchesSearch = seatNoSearch
      ? row.seat_no.toLowerCase().includes(seatNoSearch.toLowerCase()) ||
        row.student_name.toLowerCase().includes(seatNoSearch.toLowerCase()) ||
        row.course_code.toLowerCase().includes(seatNoSearch.toLowerCase()) ||
        row.course_name.toLowerCase().includes(seatNoSearch.toLowerCase())
      : true;

    return matchesProgram && matchesSemester && matchesSearch;
  });

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      {/* Heading */}
      <h2 className="text-2xl font-extrabold text-center text-red-700 mb-6">
        Attendance Records - {departmentName}
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap justify-end items-center gap-4 mb-6">
        {/* Program Dropdown */}
        <select
          className="border border-gray-300 p-2 rounded-lg shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
        >
          <option value="">All Programs</option>
          {uniquePrograms.map((prog, idx) => (
            <option key={idx} value={prog}>
              {prog}
            </option>
          ))}
        </select>

        {/* Semester Dropdown */}
        <select
          className="border border-gray-300 p-2 rounded-lg shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
        >
          <option value="">All Semesters</option>
          {[...Array(8)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Semester {i + 1}
            </option>
          ))}
        </select>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Seat No, Name, Course Code or Course Name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={seatNoSearch}
            onChange={(e) => setSeatNoSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full text-sm text-left border border-gray-200">
          <thead className="bg-green-100 text-green-800 uppercase text-sm font-semibold">
            <tr>
              <th className="px-4 py-3 border">Course Code</th>
              <th className="px-4 py-3 border">Course Name</th>
              <th className="px-4 py-3 border">Program</th>
              <th className="px-4 py-3 border">Semester No</th>
              <th className="px-4 py-3 border">Student Name</th>
              <th className="px-4 py-3 border">Seat No</th>
              <th className="px-4 py-3 border">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-green-50 transition`}
                >
                  <td className="px-4 py-2 border">{row.course_code}</td>
                  <td className="px-4 py-2 border">{row.course_name}</td>
                  <td className="px-4 py-2 border">{row.program}</td>
                  <td className="px-4 py-2 border">{row.sem_no}</td>
                  <td className="px-4 py-2 border">{row.student_name}</td>
                  <td className="px-4 py-2 border">{row.seat_no}</td>
                  <td className="px-4 py-2 border">{row.percentage}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center text-gray-500 py-6 italic"
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
