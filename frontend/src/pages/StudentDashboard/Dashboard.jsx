import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import {
  Home,
  ClipboardList,
  Send,
  HelpCircle,
  ChevronDown,
  User,
} from "lucide-react";
import Profile from "./Profile";

// Dummy forms list
const formsList = [
  { title: "Proforma Form" },
  { title: "G1 Form" },
  { title: "Transcript Request" },
];

// Dummy statuses
const statuses = [
  { title: "Submitted", date: "30/07/2025", status: "Completed", color: "bg-green-100 text-green-700" },
  { title: "Department Approval", date: "01/08/2025", status: "Completed", color: "bg-green-100 text-green-700" },
  { title: "University Approved", date: "02/08/2025", status: "Completed", color: "bg-green-100 text-green-700" },
  { title: "In Progress", date: "", status: "Ongoing", color: "bg-yellow-100 text-yellow-700" },
  { title: "Completed", date: "", status: "Pending", color: "bg-red-100 text-red-700" },
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [seatNo, setSeatNo] = useState(
    () => localStorage.getItem("seatNo") || "Unknown User"
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const studentName = localStorage.getItem("studentName");
  const userId = parseInt(localStorage.getItem("userId"), 10);
  console.log("👉 StudentDashboard userId:", userId);


  useEffect(() => {
    document.title = "UOK-DFS - Dashboard";
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "seatNo") {
        setSeatNo(e.newValue || "Unknown User");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Active page state
  const [selectedForm, setSelectedForm] = useState("Home");

  // Tracking
  const [submittedForms] = useState(["Proforma Form"]);
  const hasSubmitted = selectedForm === "Home" || submittedForms.includes(selectedForm);

  // 🔥 Content rendering helper
  const renderContent = () => {
    switch (selectedForm) {
      case "Home":
        return (
          <>
            <h2 className="text-2xl font-bold text-green-700 mb-6">Tracking Overview</h2>
            {hasSubmitted ? (
              <div className="flex gap-6 overflow-x-auto pb-4">
                {statuses.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex-shrink-0 w-69 h-64 relative group p-6 rounded-2xl border border-green-100 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 
                      ${item.status === "Completed" ? "bg-green-50 hover:bg-green-100" : "bg-white/80 backdrop-blur-lg hover:bg-green-50"}
                    `}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-700">
                      {item.title}
                    </h3>
                    {item.date && <p className="text-sm text-gray-600 mt-1">📅 {item.date}</p>}
                    <span className={`absolute bottom-6 inline-block px-3 py-1 text-sm font-medium rounded-full ${item.color}`}>
                      {item.status}
                    </span>
                    <div className="absolute bottom-0 left-0 w-0 h-1 bg-green-500 group-hover:w-full transition-all duration-300 rounded-b-xl"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-yellow-800 shadow-md">
                <h3 className="text-lg font-semibold">No Request Found</h3>
                <p className="mt-2 text-sm">
                  You have not submitted this form yet. Please submit a new request to start tracking.
                </p>
              </div>
            )}
          </>
        );

      case "My Profile":
        return <Profile userId={userId} />; 

      case "My Requests":
        return (
          <>
            <h2 className="text-2xl font-bold text-green-700 mb-6">My Requests</h2>
            <p className="text-gray-600">📌 List of submitted requests will appear here.</p>
          </>
        );

      default:
        return (
          <>
            <h2 className="text-2xl font-bold text-green-700 mb-6">{selectedForm} - Submit Request</h2>
            <p className="text-gray-600">📝 Form for {selectedForm} will be here.</p>
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-white text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-78 bg-gradient-to-b from-green-50 to-white shadow-xl flex flex-col justify-between p-6 rounded-r-3xl">
        <div>
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="UOK Logo" className="w-20 h-20 object-contain mb-3 rounded-full shadow-md border border-green-200" />
            <h1 className="text-xl font-bold text-green-700 tracking-tight">Student Dashboard</h1>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-4 text-sm">
            <button
              onClick={() => setSelectedForm("Home")}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow font-medium transition-all
                ${selectedForm === "Home" ? "bg-green-100 text-green-700" : "bg-white hover:bg-green-50 text-gray-700"}`}
            >
              <Home className="w-5 h-5 text-green-600" /> Home
            </button>

            <button
              onClick={() => setSelectedForm("My Profile")}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow font-medium transition-all
                ${selectedForm === "My Profile" ? "bg-green-100 text-green-700" : "bg-white hover:bg-green-50 text-gray-700"}`}
            >
              <User className="w-5 h-5 text-green-600" /> My Profile
            </button>

            <button
              onClick={() => setSelectedForm("My Requests")}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow font-medium transition-all
                ${selectedForm === "My Requests" ? "bg-green-100 text-green-700" : "bg-white hover:bg-green-50 text-gray-700"}`}
            >
              <ClipboardList className="w-5 h-5 text-green-600" /> My Requests
            </button>

            {/* Submit Request with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full px-5 py-4 rounded-2xl bg-white shadow hover:bg-green-50 hover:shadow-lg text-gray-700 font-medium transition-all"
              >
                <span className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-green-600" /> Submit Request
                </span>
                <ChevronDown
                  className={`w-4 h-4 transform transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="mt-3 flex flex-col gap-3">
                  {formsList.map((form, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedForm(form.title);
                        setIsDropdownOpen(false);
                      }}
                      className="px-5 py-4 rounded-2xl bg-gradient-to-r from-green-50 to-white border border-green-100 shadow text-gray-700 font-medium transition-all duration-300 transform opacity-0 animate-slideFadeIn"
                      style={{ animationDelay: `${idx * 0.15}s`, animationFillMode: "forwards" }}
                    >
                      {form.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Bottom FAQ */}
        <div className="mt-8">
          <button
            onClick={() => navigate("/faq")}
            className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl bg-white shadow hover:bg-green-50 hover:shadow-lg text-gray-700 font-medium transition-all"
          >
            <HelpCircle className="w-5 h-5 text-green-600" /> Help / FAQs
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <Header studentName={studentName} />
        <div className="p-8">
          <div className="bg-white/70 backdrop-blur-md shadow-xl rounded-3xl p-8 border border-green-100">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
