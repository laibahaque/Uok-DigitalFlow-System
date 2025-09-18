import React from "react";
import SemesterPayments from "../../../components/SemesterPayments";

const APPayments = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center text-green-800 mb-6">
        Applied Physics Department - Semester Payments
      </h1>
      <SemesterPayments departmentName="Applied Physics" />
    </div>
  );
};

export default APPayments;
