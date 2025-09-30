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
import Proforma from "./Forms/Proforma";
import G1 from "./Forms/G1";
import Transcript from "./Forms/Transcript";
import TrackingCards from "./TrackingCards";

const formsList = [
  { title: "Proforma Form" },
  { title: "G1 Form" },
  { title: "Transcript Request" },
];

const statuses = [
  {
    title: "Submitted",
    date: "30/07/2025",
    status: "Completed",
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Department Approval",
    date: "01/08/2025",
    status: "Completed",
    color: "bg-green-100 text-green-700",
  },
  {
    title: "University Approved",
    date: "02/08/2025",
    status: "Completed",
    color: "bg-green-100 text-green-700",
  },
  {
    title: "In Progress",
    date: "",
    status: "Ongoing",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    title: "Completed",
    date: "",
    status: "Pending",
    color: "bg-red-100 text-red-700",
  },
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [seatNo, setSeatNo] = useState(
    () => localStorage.getItem("seatNo") || "Unknown User"
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState("Home");
  const [studentInfo, setStudentInfo] = useState(null);
  const [requests, setRequests] = useState([]);

  const storedUser = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user"))
    : null;

  const studentName = storedUser?.email || "Unknown";
  const userId = storedUser?.id || null;

  useEffect(() => {
    // console.log("🎓 StudentDashboard mounted, userId:", userId);

    const fetchProfile = async () => {
      // console.log("🔑 Token being sent:", localStorage.getItem("token"));

      try {
        // console.log("📡 Fetching Student Profile...");
        const res = await fetch("http://localhost:5000/api/users/student/me", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        // console.log("✅ Profile Data:", data);
        if (res.ok) setStudentInfo(data);
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);


  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/requests/my", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,

          },
        });
        const data = await res.json();
        if (res.ok) setRequests(data);
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };
    fetchRequests();
  }, []);

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

  const submittedForms = ["Proforma Form"];
  const hasSubmitted = requests.length > 0;

  const renderContent = () => {
    switch (selectedForm) {
      case "Home":
        return (
          <>
            <h2 className="text-2xl font-bold text-green-700 mb-6">
              Tracking Overview
            </h2>
            {hasSubmitted ? (
              <div className="space-y-8">
                {requests.map((req) => (
                  <TrackingCards key={req.id} requestId={req.id} />
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-yellow-800 shadow-md">
                <h3 className="text-lg font-semibold">No Request Found</h3>
                <p className="mt-2 text-sm">
                  You have not submitted any requests yet. Please submit a new request to start tracking.
                </p>
              </div>
            )}


          </>
        );

      case "My Profile":
        return <Profile profile={studentInfo} userId={userId} />;

      case "Proforma Form":
        return <Proforma userId={userId} studentInfo={studentInfo} selectedForm={selectedForm} />;

      case "G1 Form":
        return <G1 userId={userId} studentInfo={studentInfo} selectedForm={selectedForm} />;

      case "Transcript Request":
        return <Transcript userId={userId} studentInfo={studentInfo} selectedForm={selectedForm} />;

      case "My Requests":
        return (
          <>
            <h2 className="text-2xl font-bold text-green-700 mb-6">
              My Requests
            </h2>

            {requests.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-yellow-800 shadow-md">
                <h3 className="text-lg font-semibold">No Request Found</h3>
                <p className="mt-2 text-sm">
                  📌 You have not submitted any requests yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl shadow">
                <table className="min-w-full border border-green-100">
                  <thead className="bg-green-100 text-green-800">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Form Type</th>
                      <th className="px-4 py-3 text-left">Semester</th>
                      <th className="px-4 py-3 text-left">Exam Type</th>
                      <th className="px-4 py-3 text-left">Submitted On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    {requests.map((req, idx) => (
                      <tr key={req.id} className="hover:bg-green-50">
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td className="px-4 py-2 font-medium">{req.form_type}</td>
                        <td className="px-4 py-2">
                          {req.form_type === "Proforma Form" ? req.sem_num : "—"}
                        </td>
                        <td className="px-4 py-2">
                          {req.form_type === "Proforma Form" ? req.exam_type : "—"}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(req.created_at).toLocaleDateString("en-GB")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        );


      default:
        return (
          <>
            <h2 className="text-2xl font-bold text-green-700 mb-6">
              {selectedForm} - Submit Request
            </h2>
            <p className="text-gray-600">
              📝 Form for {selectedForm} will be here.
            </p>
          </>
        );
    }
  };


  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-white text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-78 bg-gradient-to-b from-green-50 to-white shadow-xl flex flex-col justify-between p-6 rounded-r-3xl">
        <div>
          <div className="flex flex-col items-center mb-8">
            <img
              src="/logo.png"
              alt="UOK Logo"
              className="w-20 h-20 object-contain mb-3 rounded-full shadow-md border border-green-200"
            />
            <h1 className="text-xl font-bold text-green-700 tracking-tight">
              Student Dashboard
            </h1>
          </div>

          <nav className="flex flex-col gap-4 text-sm">
            <button
              onClick={() => setSelectedForm("Home")}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow font-medium transition-all
                ${selectedForm === "Home"
                  ? "bg-green-100 text-green-700"
                  : "bg-white hover:bg-green-50 text-gray-700"
                }`}
            >
              <Home className="w-5 h-5 text-green-600" /> Home
            </button>

            <button
              onClick={() => setSelectedForm("My Profile")}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow font-medium transition-all
                ${selectedForm === "My Profile"
                  ? "bg-green-100 text-green-700"
                  : "bg-white hover:bg-green-50 text-gray-700"
                }`}
            >
              <User className="w-5 h-5 text-green-600" /> My Profile
            </button>

            <button
              onClick={() => setSelectedForm("My Requests")}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow font-medium transition-all
                ${selectedForm === "My Requests"
                  ? "bg-green-100 text-green-700"
                  : "bg-white hover:bg-green-50 text-gray-700"
                }`}
            >
              <ClipboardList className="w-5 h-5 text-green-600" /> My Requests
            </button>

            {/* Submit Request */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full px-5 py-4 rounded-2xl bg-white shadow hover:bg-green-50 hover:shadow-lg text-gray-700 font-medium transition-all"
              >
                <span className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-green-600" /> Submit Request
                </span>
                <ChevronDown
                  className={`w-4 h-4 transform transition-transform ${isDropdownOpen ? "rotate-180" : ""
                    }`}
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
                      style={{
                        animationDelay: `${idx * 0.15}s`,
                        animationFillMode: "forwards",
                      }}
                    >
                      {form.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

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
          {selectedForm === "My Profile" || selectedForm === "Proforma Form"
            ? renderContent()
            : (
              <div className="bg-white/70 backdrop-blur-md shadow-xl rounded-3xl p-8 border border-green-100">
                {renderContent()}
              </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
