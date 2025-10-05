// frontend/src/pages/UniAdmin/UniRequests.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ClipboardCheck } from "lucide-react";
const UniRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const token = user?.token;

      const { data } = await axios.get(
        "http://localhost:5000/api/requests/approved",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🔥 Sort so that pending (Approved) stay on top
      const sorted = data.sort((a, b) => {
        if (a.request_status === "Faculty Approved" && b.request_status !== "Faculty Approved") return -1;
        if (a.request_status !== "Faculty Approved" && b.request_status === "Faculty Approved") return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setRequests(sorted);
    } catch (err) {
      console.error("Error fetching approved requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Accept or Reject handler
  const handleStatusChange = async (requestId, status) => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const token = user?.token;

      await axios.put(
        `http://localhost:5000/api/requests/${requestId}/unistatus`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // UI update: set In Progress or Rejected
      setRequests(prev =>
        [...prev.map(r =>
          r.request_id === requestId
            ? { ...r, request_status: status === "University Approved" ? "In Progress" : "University Rejected" }
            : r
        )].sort((a, b) => {
          if (a.request_status === "University Approved" && b.request_status !== "University Approved") return -1;
          if (a.request_status !== "University Approved" && b.request_status === "University Approved") return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        })
      );

      toast.success(
        status === "University Approved"
          ? "Request moved to In Progress!"
          : "Request Rejected!"
      );
    } catch (err) {
      toast.error("Failed to update request status!");
      console.error(`Error updating request ${status}:`, err);
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-600 py-10 text-lg animate-pulse">
        Loading approved requests...
      </p>
    );

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3 flex items-center gap-3">
        <ClipboardCheck className="w-7 h-7 text-green-600" /> {/* ← lucide icon */}
         All Requests
      </h2>
      {requests.length === 0 ? (
        <p className="text-gray-600 text-center py-6 text-lg">
          No approved requests found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-md border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="px-6 py-3 text-left">Form Type</th>
                <th className="px-6 py-3 text-left">Seat No</th>
                <th className="px-6 py-3 text-left">Program</th>
                <th className="px-6 py-3 text-left">Department</th>
                <th className="px-6 py-3 text-left">Semester</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, i) => (
                <tr
                  key={req.request_id}
                  className={`transition duration-200 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-green-50`}
                >
                  <td className="px-6 py-3">{req.form_type}</td>
                  <td className="px-6 py-3">{req.seat_no}</td>
                  <td className="px-6 py-3">{req.program}</td>
                  <td className="px-6 py-3">{req.department_name}</td>
                  <td className="px-6 py-3">{req.sem_num || "-"}</td>
                  <td
                    className={`px-6 py-3 font-semibold ${req.request_status === "In Progress"
                        ? "text-blue-600"
                        : req.request_status === "Rejected"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                  >
                    {req.request_status}
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    {req.request_status === "Faculty Approved" ? (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(req.request_id, "University Approved")
                          }
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(req.request_id, "University Rejected")
                          }
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                        >
                          Reject
                        </button>
                      </>
                    ) : req.request_status === "In Progress" ? (
                      <button
                        disabled
                        className="bg-blue-300 text-white px-3 py-1 rounded-lg cursor-not-allowed"
                      >
                        Accepted
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-red-300 text-white px-3 py-1 rounded-lg cursor-not-allowed"
                      >
                        Rejected
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UniRequests;
