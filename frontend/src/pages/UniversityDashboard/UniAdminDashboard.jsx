import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import Header from "../../components/Header";
import {
  Home,
  FileText,
  ChevronDown,
  Users,
  HelpCircle,
} from "lucide-react";

import CSPayments from "./PaymentsRecord/CSPayments";
import ZoologyPayments from "./PaymentsRecord/ZoologyPayments";
import APPayments from "./PaymentsRecord/APPayments"
import UniRequests from "./UniRequests";

const UniAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedPage, setSelectedPage] = useState("Home");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    document.title = "UOK-DFS - University Admin Dashboard";
    if (!user || user.role !== "university-admin") {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // ✅ Home Card (Student Records)
  const renderHomeCards = () => {
    return (
      <div className="max-w-md mx-auto">
        <div
          className="bg-blue-50 relative overflow-hidden shadow-lg rounded-2xl p-8 border border-gray-100 transform transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
        >
          {/* Decorative Circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/20"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/20"></div>

          {/* Icon + Title */}
          <div className="flex items-center gap-4 mb-4">
            <FileText className="w-10 h-10 text-blue-600" />
            <h3 className="text-2xl font-bold text-gray-800">
              Student Records
            </h3>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed">
            View and manage records of all students across departments.
          </p>
        </div>
      </div>
    );
  };

  // ✅ Page Rendering Logic
  const renderContent = () => {
    switch (selectedPage) {
      case "Home":
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-red-600 mb-8 text-center">
              University Dashboard Overview
            </h2>
            {renderHomeCards()}
          </div>
        );
      case "Requests":
        return <UniRequests />;
      case "Computer Science":
        return <CSPayments />;
      case "Zoology":
        return <ZoologyPayments />;
      case "Applied Physics":
        return <APPayments />;
      default:
        return null;
    }
  };
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg flex flex-col justify-between p-6 rounded-r-3xl">
        <div>
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/logo.png"
              alt="UOK Logo"
              className="w-20 h-20 object-contain mb-3 rounded-full shadow-md border border-gray-200"
            />
            <h1 className="text-xl font-bold text-green-700 tracking-tight text-center">
              University Admin
            </h1>
          </div>

          {/* Nav Buttons */}
          <nav className="flex flex-col gap-3 text-sm">
            {/* Home */}
            <button
              onClick={() => setSelectedPage("Home")}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow font-medium transition-all
                ${selectedPage === "Home"
                  ? "bg-green-100 text-green-700"
                  : "bg-white hover:bg-green-50 text-gray-700"
                }`}
            >
              <Home className="w-5 h-5 text-green-600" /> Home
            </button>

            {/* Requests */}
            <button
              onClick={() => setSelectedPage("Requests")}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow font-medium transition-all
                ${selectedPage === "Requests"
                  ? "bg-green-100 text-green-700"
                  : "bg-white hover:bg-green-50 text-gray-700"
                }`}
            >
              <FileText className="w-5 h-5 text-green-600" /> Requests
            </button>

            {/* Departments Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full px-5 py-3 rounded-xl bg-white shadow hover:bg-green-50 hover:shadow-md text-gray-700 font-medium transition-all"
              >
                <span className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600" /> Departments
                </span>
                <ChevronDown
                  className={`w-4 h-4 transform transition-transform ${isDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="mt-2 flex flex-col gap-2">
                  {["Computer Science", "Zoology", "Applied Physics"].map((dept, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedPage(dept);
                        setIsDropdownOpen(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 shadow text-gray-700 font-medium transition-all duration-300 hover:bg-green-100"
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Help / FAQs */}
        <div className="mt-8">
          <button
            onClick={() => navigate("/faq")}
            className="flex items-center gap-3 w-full px-5 py-3 rounded-xl bg-white shadow hover:bg-green-50 hover:shadow-md text-gray-700 font-medium transition-all"
          >
            <HelpCircle className="w-5 h-5 text-green-600" /> Help / FAQs
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <Header
          adminName={user?.name || "University Admin"}
          onNotificationClick={() => setSelectedPage("Requests")}
        />
        {renderContent()}
      </main>
    </div>
  );
};

export default UniAdminDashboard;
