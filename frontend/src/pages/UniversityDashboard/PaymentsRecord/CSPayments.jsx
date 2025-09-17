import React from "react";
import SemesterPayments from "../../../components/SemesterPayments";

const CSPayments = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center text-green-800 mb-6">
        Computer Science Department - Semester Payments
      </h1>
      <SemesterPayments departmentName="Computer Science" />
    </div>
  );
};

export default CSPayments;
