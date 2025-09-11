import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { FileText, Bell, HelpCircle, Send } from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [seatNo, setSeatNo] = useState(() => localStorage.getItem("seatNo") || "Unknown User");
  const [notificationCount, setNotificationCount] = useState(3);

  // Simulating fetch from session/localStorage
  const userType = localStorage.getItem("userType"); // "admin" ya "student"
  const studentName = localStorage.getItem("studentName"); 
  const adminName = localStorage.getItem("adminName");

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "seatNo") {
        setSeatNo(e.newValue || "Unknown User");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col p-6 space-y-6">
        <div className="text-2xl font-bold text-green-600">Student Dashboard</div>
        <nav className="flex flex-col gap-4 text-sm">
          <button onClick={() => navigate("/form")} className="flex items-center gap-3 text-gray-700 hover:text-green-600">
            <Send className="w-5 h-5" /> Submit Request
          </button>
          <button onClick={() => navigate("/tracking")} className="flex items-center gap-3 text-gray-700 hover:text-green-600">
            <FileText className="w-5 h-5" /> Tracking Requests
          </button>
          <button onClick={() => navigate("/notifications")} className="flex items-center gap-3 text-gray-700 hover:text-green-600">
            <Bell className="w-5 h-5" /> Notifications
            {notificationCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {notificationCount}
              </span>
            )}
          </button>
          <button onClick={() => navigate("/faq")} className="flex items-center gap-3 text-gray-700 hover:text-green-600">
            <HelpCircle className="w-5 h-5" /> Help / FAQs
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ">
        {/* 🔹 New Header Component */}
        <Header
          notificationCount={notificationCount}
          studentName={studentName}
          adminName={adminName}
        />

        {/* Placeholder */}
        <div className="bg-white p-10 rounded-xl shadow-md text-center text-gray-600">
          <p className="text-lg">Welcome to your dashboard! Use the sidebar to navigate.</p>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
