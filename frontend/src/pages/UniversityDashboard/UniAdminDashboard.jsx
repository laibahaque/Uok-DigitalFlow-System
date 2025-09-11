// src/pages/UniversityDashboard/UniAdminDashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import Header from "../../components/Header";
import { Users, FileText, BarChart3, Bell, Layers } from "lucide-react";

const UniAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [notificationCount, setNotificationCount] = useState(5);

  // ✅ Dummy data (backend se replace karna baad mein)
  const stats = {
    totalRequests: 120,
    pendingRequests: 35,
    completedRequests: 85,
    activeDepartments: 8,
  };

  const filteredRequests = [
    { id: 1, student: "Ali Khan", type: "Transcript", status: "Pending" },
    { id: 2, student: "Sara Ahmed", type: "Performa Form", status: "Approved" },
    { id: 3, student: "Hamza Iqbal", type: "Degree Verification", status: "Rejected" },
  ];

  useEffect(() => {
    document.title = "UOK-DFS - University Admin Dashboard";

    if (!user || user.role !== "uni_admin" ) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col p-6 space-y-6">
        <div className="text-2xl font-bold text-green-600">Uni Admin</div>
        <nav className="flex flex-col gap-4 text-sm">
          <button
            onClick={() => navigate("/university-dashboard")}
            className="flex items-center gap-3 text-gray-700 hover:text-green-600"
          >
            <Users className="w-5 h-5" /> Dashboard vgtgtr
          </button>
          <button
            onClick={() => navigate("/university-dashboard/student-records")}
            className="flex items-center gap-3 text-gray-700 hover:text-green-600"
          >
            <FileText className="w-5 h-5" /> Student Records
          </button>
          <button
            onClick={() => navigate("/university-dashboard/departments")}
            className="flex items-center gap-3 text-gray-700 hover:text-green-600"
          >
            <Layers className="w-5 h-5" /> Departments
          </button>
          <button
            onClick={() => navigate("/university-dashboard/analytics")}
            className="flex items-center gap-3 text-gray-700 hover:text-green-600"
          >
            <BarChart3 className="w-5 h-5" /> Analytics
          </button>
          <button
            onClick={() => navigate("/university-dashboard/notifications")}
            className="flex items-center gap-3 text-gray-700 hover:text-green-600"
          >
            <Bell className="w-5 h-5" /> Notifications
            {notificationCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {notificationCount}
              </span>
            )}
          </button>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* 🔹 Shared Header Component */}
        <Header
          notificationCount={notificationCount}
          adminName={user?.email || "University Admin"}
        />

        {/* Content Area */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-green-100 p-6 rounded-xl shadow text-center">
              <p className="text-2xl font-bold">{stats.totalRequests}</p>
              <p className="text-gray-600">Total Requests</p>
            </div>
            <div className="bg-yellow-100 p-6 rounded-xl shadow text-center">
              <p className="text-2xl font-bold">{stats.pendingRequests}</p>
              <p className="text-gray-600">Pending</p>
            </div>
            <div className="bg-blue-100 p-6 rounded-xl shadow text-center">
              <p className="text-2xl font-bold">{stats.completedRequests}</p>
              <p className="text-gray-600">Completed</p>
            </div>
            <div className="bg-purple-100 p-6 rounded-xl shadow text-center">
              <p className="text-2xl font-bold">{stats.activeDepartments}</p>
              <p className="text-gray-600">Active Departments</p>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white p-6 rounded-xl shadow mt-6">
            <h2 className="text-xl font-bold mb-4">Recent Requests</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3">Student</th>
                  <th className="p-3">Request Type</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3">{req.student}</td>
                    <td className="p-3">{req.type}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          req.status === "Approved"
                            ? "bg-green-200 text-green-700"
                            : req.status === "Rejected"
                            ? "bg-red-200 text-red-700"
                            : "bg-yellow-200 text-yellow-700"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UniAdminDashboard;
