import React, { useEffect, useState } from "react";
import { CheckCircle, Clock, Send, Calendar } from "lucide-react"; // Lucide icons

const defaultStatuses = [
  "Submitted",
  "Department Approval",
  "University Approval",
  "In Progress",
  "Completed",
];

const statusColors = {
  Submitted: "bg-gradient-to-br from-green-100 to-green-200",
  "Department Approval": "bg-gradient-to-br from-blue-100 to-blue-200",
  "University Approval": "bg-gradient-to-br from-purple-100 to-purple-200",
  "In Progress": "bg-gradient-to-br from-yellow-100 to-yellow-200",
  Completed: "bg-gradient-to-br from-red-100 to-red-200",
  Pending: "bg-gray-100",
};

const badgeColors = {
  Approved: "bg-green-600 text-white",
  Rejected: "bg-red-600 text-white",
  Pending: "bg-yellow-400 text-black",
};

const TrackingCards = ({ requestId }) => {
  const [logs, setLogs] = useState([]);
  const [formType, setFormType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
  const fetchLogs = async () => {
    if (!requestId) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `http://localhost:5000/api/requests/logs/${requestId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (!res.ok) throw new Error(`Failed to fetch logs: ${res.status}`);

      const data = await res.json();
      console.log("API Response:", data);

      // form_type comes from the backend
      setFormType(data.form_type || "");
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

  // ✅ Show "No Request Found" only if logs is empty
  if (logs.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-yellow-800 shadow-md">
        <h3 className="text-lg font-semibold">No Request Found</h3>
        <p className="mt-2 text-sm">
          You have not submitted any requests yet. Please submit a new request to start tracking.
        </p>
      </div>
    );
  }

  // Helper function for messages
  const getStatusMessage = (status, logs) => {
    const submittedLog = logs.find((l) => l.status === "Submitted");
    const deptApproved = logs.find((l) => l.status === "Department Approval");
    const uniApproved = logs.find((l) => l.status === "University Approval");
    const inProgressLog = logs.find((l) => l.status === "In Progress");
    const completedLog = logs.find((l) => l.status === "Completed");
    const rejectedLog = logs.find((l) => l.status === "Rejected");

    switch (status) {
      case "Submitted":
        return submittedLog ? "Your request has been submitted." : "";

      case "Department Approval":
        if (!deptApproved) return "Requested Faculty Admin for approval.";
        return "Faculty admin approved.";

      case "University Approval":
        if (!deptApproved) return "Waiting for faculty admin approval first.";
        if (!uniApproved && !rejectedLog) return "Requested University Admin for approval.";
        if (uniApproved) return "University approved your request.";
        if (rejectedLog) return "University rejected your request.";
        return "";

      case "In Progress":
        if (!uniApproved) return "Waiting for approvals to start progress.";
        return "In progress (5-7 working days).";

      case "Completed":
        if (inProgressLog) return "Soon to be completed.";
        if (completedLog) return "Request completed successfully.";
        return "";

      default:
        return "";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {formType && (
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          Tracking for: {formType}
        </h2>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {defaultStatuses.map((status) => {
          const log = logs.find((l) => l.status === status);

          // Determine card color
          let colorClass = statusColors[status] || statusColors.Pending;

          // Badge logic
          const badgeText = log
            ? log.status === "Rejected"
              ? "Rejected"
              : "Approved"
            : "Pending";

          const badgeClass = log
            ? log.status === "Rejected"
              ? badgeColors.Rejected
              : badgeColors.Approved
            : badgeColors.Pending;

          // Icon for each status
          let statusIcon;
          switch (status) {
            case "Submitted":
              statusIcon = <Send className="w-5 h-5 text-gray-700" />;
              break;
            case "Department Approval":
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

          const message = getStatusMessage(status, logs);

          return (
            <div
              key={status}
              className={`relative p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${colorClass} flex flex-col justify-between h-56`}
            >
              {/* Title */}
              <div className="flex items-center gap-2 mb-3">
                {statusIcon}
                <h3 className="text-lg font-semibold text-gray-800">{status}</h3>
              </div>

              {/* Message Section */}
              <div className="flex-grow flex items-center justify-center">
                {message && (
                  <p className="text-sm text-gray-700 text-center leading-relaxed">
                    {message}
                  </p>
                )}
              </div>

              {/* Footer Section */}
              <div className="mt-4 flex flex-col items-center gap-2">
                {/* Date */}
                {log && log.updated_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(log.updated_at).toLocaleDateString()}
                  </div>
                )}

                {/* Badge */}
                <span
                  className={`px-4 py-1 text-sm font-medium rounded-full text-center transform transition-all duration-500 hover:scale-110 ${badgeClass}`}
                >
                  {badgeText}
                </span>
              </div>

              {/* Gradient line bottom */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-b-xl"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingCards;
