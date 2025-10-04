import React, { useEffect, useState } from "react";
import { CheckCircle, Clock, Send, Calendar } from "lucide-react";

const statuses = [
  "Submitted",
  "Faculty Approval",
  "University Approval",
  "In Progress",
];

const statusColors = {
  Submitted: "bg-gradient-to-br from-green-100 to-green-200",
  "Faculty Approval": "bg-gradient-to-br from-blue-100 to-blue-200",
  "University Approval": "bg-gradient-to-br from-purple-100 to-purple-200",
  "In Progress": "bg-gradient-to-br from-yellow-100 to-yellow-200",
  Completed: "bg-gradient-to-br from-red-100 to-red-200",
  Pending: "bg-gray-100",
};

const badgeColors = {
  Submitted: "bg-blue-600 text-white",
  Approved: "bg-green-600 text-white",
  Rejected: "bg-red-600 text-white",
  Pending: "bg-yellow-400 text-black",
  Completed: "bg-green-700 text-white",
};

const TrackingCards = ({ requestId }) => {
  const [logs, setLogs] = useState([]);
  const [formType, setFormType] = useState("");
  const [semNum, setSemNum] = useState(null);
  const [examType, setExamType] = useState(null);
  const [courseCode, setCourseCode] = useState(null);
  const [courseName, setCourseName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      if (!requestId) return;

      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `http://localhost:5000/api/requests/${requestId}/logs`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        if (!res.ok) throw new Error(`Failed to fetch logs: ${res.status}`);

        const data = await res.json();
        console.log("API Response:", data);

        setFormType(data.form_type || "");
        setSemNum(data.sem_num || null);
        setExamType(data.exam_type || null);
        setCourseCode(data.course_code || null);
        setCourseName(data.course_name || null);
        setLogs(data.logs || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load logs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [requestId]);

  if (loading) return <p>Loading tracking info...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  if (logs.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-yellow-800 shadow-md">
        <h3 className="text-lg font-semibold">No Request Found</h3>
        <p className="mt-2 text-sm">
          You have not submitted any requests yet. Please submit a new request
          to start tracking.
        </p>
      </div>
    );
  }

  // ✅ Dynamic Heading logic
  const getHeading = () => {
    if (!formType) return "";

    switch (formType) {
      case "Proforma":
      case "Proforma Form":
        return `Tracking for: Proforma Form Sem ${semNum || "?"} ${
          examType ? `(${examType})` : ""
        }`;

      case "Transcript":
      case "Transcript Form":
        return "Tracking for: Transcript Form";

      case "G1 Form":
        return `Tracking for: G1 Form Sem ${semNum || "?"}${
          courseCode && courseName
            ? ` Course: ${courseCode}, ${courseName}`
            : ""
        }`;

      default:
        return `Tracking for: ${formType}`;
    }
  };

  // ✅ Status Message Logic
  const getStatusMessage = (status) => {
    const submitted = logs.find((l) => l.status === "Submitted");
    const facultyApproved = logs.find((l) => l.status === "Faculty Approved");
    const universityApproved = logs.find(
      (l) => l.status === "University Approved"
    );
    const inProgress = logs.find((l) => l.status === "In Progress");
    const completed = logs.find((l) => l.status === "Completed");
    const rejected = logs.find((l) => l.status === "Rejected");

    switch (status) {
      case "Submitted":
        return submitted ? "Your request has been submitted." : "";

      case "Faculty Approval":
        return facultyApproved
          ? "Faculty admin approved."
          : "Requested Faculty Admin for approval.";

      case "University Approval":
        if (!facultyApproved) return "Waiting for faculty admin approval first.";
        if (universityApproved) return "University approved your request.";
        if (rejected) return "University rejected your request.";
        return "Requested University Admin for approval.";

      case "In Progress": {
        if (!universityApproved)
          return "Waiting for approvals to start progress.";
        if (completed) return "Request completed successfully.";
        return "In progress (5–7 working days).";
      }

      default:
        return "";
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      {/* ✅ Dynamic Heading */}
      {formType && (
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          {getHeading()}
        </h2>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statuses.map((status) => {
          let backendStatus = status;
          if (status === "Faculty Approval") backendStatus = "Faculty Approved";
          if (status === "University Approval")
            backendStatus = "University Approved";

          const log = logs.find((l) => l.status === backendStatus);
          const completedLog = logs.find((l) => l.status === "Completed");

          let effectiveStatus = status;
          if (status === "In Progress" && completedLog) {
            effectiveStatus = "Completed";
          }

          const colorClass =
            statusColors[effectiveStatus] || statusColors.Pending;

          let badgeText = "Pending";
          let badgeClass = badgeColors.Pending;

          if (effectiveStatus === "Submitted" && log) {
            badgeText = "Submitted";
            badgeClass = badgeColors.Submitted;
          } else if (effectiveStatus === "Completed" && completedLog) {
            badgeText = "Completed";
            badgeClass = badgeColors.Completed;
          } else if (log) {
            if (log.status === "Rejected") {
              badgeText = "Rejected";
              badgeClass = badgeColors.Rejected;
            } else {
              badgeText = "Approved";
              badgeClass = badgeColors.Approved;
            }
          }

          let statusIcon;
          switch (effectiveStatus) {
            case "Submitted":
              statusIcon = <Send className="w-5 h-5 text-gray-700" />;
              break;
            case "Faculty Approval":
            case "University Approval":
            case "Completed":
              statusIcon = <CheckCircle className="w-5 h-5 text-gray-700" />;
              break;
            case "In Progress":
              statusIcon = <Clock className="w-5 h-5 text-gray-700" />;
              break;
            default:
              statusIcon = null;
          }

          const message = getStatusMessage(status);

          return (
            <div
              key={status}
              className={`relative p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${colorClass} flex flex-col justify-between h-56`}
            >
              <div className="flex items-center gap-2 mb-3">
                {statusIcon}
                <h3 className="text-lg font-semibold text-gray-800">
                  {effectiveStatus}
                </h3>
              </div>

              <div className="flex-grow flex items-center justify-center">
                {message && (
                  <p className="text-sm text-gray-700 text-center leading-relaxed">
                    {message}
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-col items-center gap-2">
                {(completedLog?.created_at || log?.created_at) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(
                      completedLog?.created_at || log?.created_at
                    ).toLocaleDateString()}
                  </div>
                )}
                <span
                  className={`px-4 py-1 text-sm font-medium rounded-full text-center transform transition-all duration-500 hover:scale-110 ${badgeClass}`}
                >
                  {badgeText}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-b-xl"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingCards;
