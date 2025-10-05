// frontend/src/pages/FacultyAdmin/Requests.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ClipboardCheck } from "lucide-react";
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

                // 🔥 Sorting logic yahan
                const sortedRequests = res.data.sort((a, b) => {
                    if (a.request_status === "Submitted" && b.request_status !== "Submitted") return -1;
                    if (a.request_status !== "Submitted" && b.request_status === "Submitted") return 1;
                    return new Date(b.created_at) - new Date(a.created_at); // latest first
                });

                setRequests(sortedRequests);
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
                    .sort((a, b) => {
                        if (a.request_status === "Submitted" && b.request_status !== "Submitted") return -1;
                        if (a.request_status !== "Submitted" && b.request_status === "Submitted") return 1;
                        return new Date(b.created_at) - new Date(a.created_at);
                    })
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
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3 flex items-center gap-3">
                <ClipboardCheck className="w-7 h-7 text-green-600" /> {/* ← lucide icon */}
                All Requests
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
                                        className={`px-6 py-3 font-semibold ${req.request_status === "Faculty Approved"
                                                ? "text-green-600"
                                                : req.request_status === "Faculty Rejected" ||
                                                    req.request_status === "University Rejected"
                                                    ? "text-red-600"
                                                    : "text-yellow-600"
                                            }`}
                                    >
                                        {req.request_status}
                                    </td>

                                    <td className="px-6 py-3 flex gap-2">
                                        <td className="px-6 py-3 flex gap-2">
                                            {req.request_status === "Submitted" ? (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(req.request_id, "Faculty Approved")}
                                                        className="px-3 py-1 rounded-lg text-sm bg-green-500 hover:bg-green-600 text-white"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(req.request_id, "Faculty Rejected")}
                                                        className="px-3 py-1 rounded-lg text-sm bg-red-500 hover:bg-red-600 text-white"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            ) : req.request_status === "Faculty Approved" ? (
                                                <button
                                                    disabled
                                                    className="px-3 py-1 rounded-lg text-sm bg-green-300 cursor-not-allowed text-white"
                                                >
                                                    Accepted
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="px-3 py-1 rounded-lg text-sm bg-red-300 cursor-not-allowed text-white"
                                                >
                                                    Rejected
                                                </button>
                                            )}
                                        </td>

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
