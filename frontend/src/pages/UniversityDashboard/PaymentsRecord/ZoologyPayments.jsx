import React from "react";
import SemesterPayments from "../../../components/SemesterPayments";

const ZoologyPayments = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center text-green-800 mb-6">
        Zoology Department - Semester Payments
      </h1>
      <SemesterPayments departmentName="Zoology" />
    </div>
  );
};

export default ZoologyPayments;
