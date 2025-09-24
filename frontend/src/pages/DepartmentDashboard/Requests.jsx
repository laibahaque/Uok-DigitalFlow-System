import React, { useEffect, useState } from "react";
import axios from "axios";

const Request = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);



useEffect(() => {
  const fetchRequests = async () => {
    try {
      console.log("📡 Fetching requests...");
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token;
      console.log("Token:", token);

      if (!token) {
        console.error("⚠️ No token found. Please log in again.");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/requests/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Response:", res.data);
      setRequests(res.data);
    } catch (err) {
      console.error("❌ Error fetching requests:", err);
    } finally {
      console.log("⏳ Setting loading to false");
      setLoading(false);
    }
  };

  fetchRequests();
}, []);


  if (loading) return <p>Loading requests...</p>;

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <h2 className="text-2xl font-extrabold text-center text-red-700 mb-6">
        Student Requests
      </h2>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full text-sm text-left border border-gray-200">
          <thead className="bg-green-100 text-green-800 uppercase text-sm font-semibold">
            <tr>
              <th className="px-4 py-3 border">Request Type</th>
              <th className="px-4 py-3 border">Seat No</th>
              <th className="px-4 py-3 border">Program</th>
              <th className="px-4 py-3 border">Department</th>
              <th className="px-4 py-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((req, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {/* ✅ Use `form_type` instead of request_type */}
                  <td className="px-4 py-2 border">{req.form_type}</td>
                  <td className="px-4 py-2 border">{req.seat_no}</td>
                  <td className="px-4 py-2 border">{req.program}</td>
                  <td className="px-4 py-2 border">{req.depart_name}</td>
                  <td className="px-4 py-2 border">{req.current_status || "Pending"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-6 italic">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Request;
