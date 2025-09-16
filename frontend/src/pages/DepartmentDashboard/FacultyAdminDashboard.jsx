import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import Header from "../../components/Header";
import {
  Home,
  ClipboardList,
  ChevronDown,
  Users,
  HelpCircle,
  Cpu,
  Briefcase,
  Activity,
} from "lucide-react";

const departmentsList = [
  {
    name: "Department Of Computer Science",
    options: ["Semester Results", "Attendance"],
    bg: "bg-blue-50",
    icon: Cpu,
    iconColor: "text-blue-500",
  },
  {
    name: "Department Of Public Administration",
    options: ["Semester Results", "Attendance"],
    bg: "bg-yellow-50",
    icon: Briefcase,
    iconColor: "text-yellow-500",
  },
  {
    name: "Department Of Zoology",
    options: ["Semester Results", "Attendance"],
    bg: "bg-purple-50",
    icon: Activity,
    iconColor: "text-purple-500",
  },
];

const FacultyAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedForm, setSelectedForm] = useState("Home");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedDept, setExpandedDept] = useState(null); // sirf ek dept expand hoga

  useEffect(() => {
    document.title = "UOK-DFS - Faculty Admin Dashboard";
    if (!user || user.role !== "dept_admin") {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const handleDeptClick = (deptName) => {
    setExpandedDept(expandedDept === deptName ? null : deptName);
  };

  const renderHomeCards = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {departmentsList.map((dept) => (
          <div
            key={dept.name}
            className={`${dept.bg} relative overflow-hidden shadow-lg rounded-2xl p-6 border border-gray-100 cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl`}
          >
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/20"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/20"></div>

            {/* Department Title */}
            <div className="flex items-center gap-3 mb-4">
              {React.createElement(dept.icon, {
                className: `w-6 h-6 ${dept.iconColor}`,
              })}
              <h3
                className="text-xl font-semibold text-green-700 hover:text-green-800 transition-colors"
                onClick={() => handleDeptClick(dept.name)}
              >
                {dept.name}
              </h3>
            </div>

            {/* Options for clicked department */}
            {expandedDept === dept.name && (
              <ul className="mt-4 space-y-2">
                {dept.options.map((opt, idx) => (
                  <li
                    key={idx}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-green-50 transition transform text-gray-700 font-medium cursor-pointer"
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (selectedForm) {
      case "Home":
        return (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-red-600 mb-8 text-center">
              View All Records
            </h2>
            {renderHomeCards()}
          </div>
        );

      case "Requests":
        return (
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100 transition transform hover:scale-105 hover:shadow-2xl">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">
              All Requests
            </h2>
            <p className="text-gray-600">
              📌 List of department requests will appear here.
            </p>
          </div>
        );

      case "Departments":
        return (
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100 transition transform hover:scale-105 hover:shadow-2xl">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">
              {expandedDept || "Select a Department"}
            </h2>
            <p className="text-gray-600">
              📝 Department-specific requests and info will appear here.
            </p>
          </div>
        );

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
              Faculty Admin
            </h1>
          </div>

          {/* Nav Buttons */}
          <nav className="flex flex-col gap-3 text-sm">
            {/* Home */}
            <button
              onClick={() => setSelectedForm("Home")}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow font-medium transition-all
                ${selectedForm === "Home"
                  ? "bg-green-100 text-green-700"
                  : "bg-white hover:bg-green-50 text-gray-700"
                }`}
            >
              <Home className="w-5 h-5 text-green-600" /> Home
            </button>

            {/* Requests */}
            <button
              onClick={() => setSelectedForm("Requests")}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow font-medium transition-all
                ${selectedForm === "Requests"
                  ? "bg-green-100 text-green-700"
                  : "bg-white hover:bg-green-50 text-gray-700"
                }`}
            >
              <ClipboardList className="w-5 h-5 text-green-600" /> Requests
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
                  className={`w-4 h-4 transform transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="mt-2 flex flex-col gap-2">
                  {["Computer Science", "Zoology", "Public Administration"].map((dept, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedForm("Department");
                        setSelectedDept(dept);
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
        <Header adminName={user?.name || "Department Admin"} />
        {renderContent()}
      </main>
    </div>
  );
};

export default FacultyAdminDashboard;
