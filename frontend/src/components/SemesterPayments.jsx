import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";

const SemesterPayments = ({ departmentName }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [programFilter, setProgramFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const encodedDept = encodeURIComponent(departmentName); // ✅ encode spaces
        const res = await axios.get(`http://localhost:5000/api/semester_payments/${encodeURIComponent(departmentName)}`);

        setData(res.data);
      } catch (err) {
        console.error("❌ Error fetching semester payments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [departmentName]);

  if (loading) return <p>Loading payments...</p>;

  const uniquePrograms = [...new Set(data.map((row) => row.program))];

  const filteredData = data.filter((row) => {
    const matchesProgram = programFilter ? row.program === programFilter : true;
    const matchesSemester = semesterFilter
      ? row.sem_no === parseInt(semesterFilter)
      : true;
    const matchesSearch = searchTerm
      ? row.seat_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.student_name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return matchesProgram && matchesSemester && matchesSearch;
  });

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <h2 className="text-2xl font-extrabold text-center text-blue-700 mb-6">
        Semester Payments - {departmentName}
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap justify-end items-center gap-4 mb-6">
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

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Seat No or Name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full text-sm text-left border border-gray-200">
          <thead className="bg-blue-100 text-blue-800 uppercase text-sm font-semibold">
            <tr>
              <th className="px-4 py-3 border">Student Name</th>
              <th className="px-4 py-3 border">Seat No</th>
              <th className="px-4 py-3 border">Program</th>
              <th className="px-4 py-3 border">Semester No</th>
              <th className="px-4 py-3 border">Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition`}
                >
                  <td className="px-4 py-2 border">{row.student_name}</td>
                  <td className="px-4 py-2 border">{row.seat_no}</td>
                  <td className="px-4 py-2 border">{row.program}</td>
                  <td className="px-4 py-2 border">{row.sem_no}</td>
                  <td className="px-4 py-2 border">{row.payment_status}</td>
                 
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-6 italic">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SemesterPayments;
