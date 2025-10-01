// frontend/src/pages/FacultyAdmin/Requests.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; 
const Requests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const user = JSON.parse(sessionStorage.getItem("user"));
                const token = user?.token;

                if (!token) return;

                const res = await axios.get(
                    "http://localhost:5000/api/requests/submitted",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setRequests(res.data);
            } catch (err) {
                console.error("Error fetching requests:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    // ✅ Update status function
    const handleStatusChange = async (id, status) => {
        try {
            await axios.put(
                `http://localhost:5000/api/requests/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
            );

            setRequests(prev =>
                [...prev.map(r => r.request_id === id ? { ...r, request_status: status } : r)]
                    .sort((a, b) => a.request_status === "Submitted" ? -1 : 1)
            );


            toast.success(`Request ${status} successfully!`);
        } catch (err) {
            toast.error("Failed to update request status!");
            console.error(err);
        }
    };

    if (loading)
        return (
            <p className="text-center text-gray-600 py-10 text-lg animate-pulse">
                Loading requests...
            </p>
        );
    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">
                📋 Submitted Requests
            </h2>
            {requests.length === 0 ? (
                <p className="text-gray-600 text-center py-6 text-lg">
                    No requests found.
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
                                <th className="px-6 py-3 text-left">Course Code</th>
                                <th className="px-6 py-3 text-left">Course Name</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Action</th>
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
                                    <td className="px-6 py-3">{req.course_code || "-"}</td>
                                    <td className="px-6 py-3">{req.course_name || "-"}</td>
                                    <td
                                        className={`px-6 py-3 font-semibold ${req.request_status === "Approved"
                                            ? "text-green-600"
                                            : req.request_status === "Rejected"
                                                ? "text-red-600"
                                                : "text-yellow-600"
                                            }`}
                                    >
                                        {req.request_status}
                                    </td>
                                    <td className="px-6 py-3 flex gap-2">
                                        <button
                                            onClick={() => handleStatusChange(req.request_id, "Approved")}
                                            disabled={req.request_status !== "Submitted"}
                                            className={`px-3 py-1 rounded-lg text-sm ${req.request_status === "Approved"
                                                ? "bg-green-300 cursor-not-allowed"
                                                : "bg-green-500 hover:bg-green-600 text-white"
                                                }`}
                                        >
                                            {req.request_status === "Approved" ? "Approved" : "Accept"}
                                        </button>

                                        <button
                                            onClick={() => handleStatusChange(req.request_id, "Rejected")}
                                            disabled={req.request_status !== "Submitted"}
                                            className={`px-3 py-1 rounded-lg text-sm ${req.request_status === "Rejected"
                                                ? "bg-red-300 cursor-not-allowed"
                                                : "bg-red-500 hover:bg-red-600 text-white"
                                                }`}
                                        >
                                            {req.request_status === "Rejected" ? "Rejected" : "Reject"}
                                        </button>
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

export default Requests;
