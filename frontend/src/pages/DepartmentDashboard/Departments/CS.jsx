import React, { useState } from "react";
import Attendance from "../../../components/Attendance";
import Results from "../../../components/Results" // 👈 Results component ko later banana hoga
import { BarChart3, FileText } from "lucide-react"; // 👈 Lucide icons import

const CS = () => {
  const [activeView, setActiveView] = useState("attendance"); // default attendance

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center text-green-800 mb-6">
        Computer Science Department
      </h1>

      {/* Buttons with Icons */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition 
            ${
              activeView === "attendance"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          onClick={() => setActiveView("attendance")}
        >
          <BarChart3 size={18} />
          Show Attendance
        </button>

        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition 
            ${
              activeView === "results"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          onClick={() => setActiveView("results")}
        >
          <FileText size={18} />
          Show Semester Results
        </button>
      </div>

      {/* Conditional Rendering */}
      {activeView === "attendance" && (
        <Attendance departmentName="Computer Science" />
      )}
      {activeView === "results" && <Results departmentName="Computer Science" />}
    </div>
  );
};

export default CS;
