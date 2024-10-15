"use client";
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";

const Analytics = ({ prescriptions, departments, doctors, salesmen }) => {
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState([]);
  const [selectedSalesman, setSelectedSalesman] = useState([]);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);

  const handleFilter = () => {
    let filtered = prescriptions;

    if (selectedDepartment.length) {
      filtered = filtered.filter((p) =>
        selectedDepartment.includes(p.department._id)
      );
    }
    if (selectedDoctor.length) {
      filtered = filtered.filter((p) => selectedDoctor.includes(p.doctor._id));
    }
    if (selectedSalesman.length) {
      filtered = filtered.filter((p) =>
        selectedSalesman.includes(p.salesman._id)
      );
    }
    if (selectedPaymentMode) {
      filtered = filtered.filter((p) => p.paymentMode === selectedPaymentMode);
    }
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(
        (p) =>
          new Date(p.createdAt) >= new Date(dateRange.start) &&
          new Date(p.createdAt) <= new Date(dateRange.end)
      );
    }

    setFilteredPrescriptions(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [
    selectedDepartment,
    selectedDoctor,
    selectedSalesman,
    selectedPaymentMode,
    dateRange,
  ]);

  const getTotalAmount = () => {
    return filteredPrescriptions.reduce(
      (sum, p) => sum + p.items.reduce((sum, item) => sum + item.price, 0),
      0
    );
  };

  const paymentSummary = () => {
    const summary = {
      cash: { count: 0, total: 0 },
      card: { count: 0, total: 0 },
      upi: { count: 0, total: 0 },
    };
    filteredPrescriptions.forEach((p) => {
      const amount = p.items.reduce((sum, item) => sum + item.price, 0);
      if (p.paymentMode === "Cash") {
        summary.cash.count += 1;
        summary.cash.total += amount;
      } else if (p.paymentMode === "Card") {
        summary.card.count += 1;
        summary.card.total += amount;
      } else if (p.paymentMode === "UPI") {
        summary.upi.count += 1;
        summary.upi.total += amount;
      }
    });
    return summary;
  };

  const departmentSummary = () => {
    const summary = {};
    filteredPrescriptions.forEach((p) => {
      const amount = p.items.reduce((sum, item) => sum + item.price, 0);
      if (!summary[p.department.name]) {
        summary[p.department.name] = { count: 0, total: 0 };
      }
      summary[p.department.name].count += 1;
      summary[p.department.name].total += amount;
    });
    return summary;
  };

  const salesmanSummary = () => {
    const summary = {};
    filteredPrescriptions.forEach((p) => {
      const amount = p.items.reduce((sum, item) => sum + item.price, 0);
      if (!summary[p.salesman?._id]) {
        summary[p.salesman?._id] = {
          name: p.salesman?.name,
          count: 0,
          total: 0,
        };
      }
      summary[p.salesman?._id].count += 1;
      summary[p.salesman?._id].total += amount;
    });
    return summary;
  };

  const paymentData = paymentSummary();
  const departmentData = departmentSummary();
  const salesmanData = salesmanSummary();

  return (
    <div className="bg-black min-h-screen">
      <Navbar route={["Analytics"]} />
      <div className="w-full bg-slate-800 p-4 space-y-3 max-w-lg text-gray-100">
        <select
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="mt-1 block text-white w-full p-4 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => setSelectedDoctor(e.target.value)}
          className="mt-1 block text-white w-full p-4 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">Select Doctor</option>
          {doctors.map((doc) => (
            <option key={doc._id} value={doc._id}>
              {doc.name}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => setSelectedSalesman(e.target.value)}
          className="mt-1 block text-white w-full p-4 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">Select Salesman</option>
          {salesmen.map((sales) => (
            <option key={sales._id} value={sales._id}>
              {sales.name}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => setSelectedPaymentMode(e.target.value)}
          className="mt-1 block text-white w-full p-4 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">Select Payment Mode</option>
          <option value="Card">Card</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
        </select>
        <div className="flex w-full justify-center items-center gap-2">
          <label htmlFor="sdate" className=" text-md font-medium text-gray-100">
            Start Date
          </label>
          <input
            id="sdate"
            type="date"
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
            className="mt-1 block text-white w-1/2 p-4 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
          />
        </div>
        <div className="flex w-full justify-center items-center gap-2">
          <label htmlFor="edate" className=" text-md font-medium text-gray-100">
            End Date
          </label>
          <input
            id="edate"
            type="date"
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
            className="mt-1 block text-white w-1/2 p-4 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
          />
        </div>
      </div>
      <div className="results text-gray-100">
        <p>Total Prescriptions: {filteredPrescriptions.length}</p>
        <p>Total Amount: {getTotalAmount()}</p>
        {/* Render filtered prescriptions if needed */}
      </div>
      <div className=" text-gray-100">
        <h2>Analytics</h2>

        {/* Section 1: Grand Total and Number of Prescriptions */}
        <div className="section">
          <h3>Total Prescriptions and Amount</h3>
          <p>Total Prescriptions: {filteredPrescriptions.length}</p>
          <p>Grand Total Amount: {getTotalAmount()}</p>
        </div>

        {/* Section 2: Payment Mode Summary */}
        <div className="section">
          <h3>Payment Mode Summary</h3>
          <p>
            Cash Payments: {paymentData.cash.count} (${paymentData.cash.total})
          </p>
          <p>
            Card Payments: {paymentData.card.count} (${paymentData.card.total})
          </p>
          <p>
            UPI Payments: {paymentData.upi.count} (${paymentData.upi.total})
          </p>
        </div>

        {/* Section 3: Department Summary */}
        <div className="section">
          <h3>Department Summary</h3>
          {Object.keys(departmentData).map((department) => (
            <p key={department}>
              {department}: {departmentData[department].count} prescriptions ($
              {departmentData[department].total})
            </p>
          ))}
        </div>

        {/* Section 4: Salesman Summary */}
        <div className="section">
          <h3>Salesman Summary</h3>
          {Object.keys(salesmanData).map((salesmanId) => (
            <p key={salesmanId}>
              {salesmanData[salesmanId].name}: {salesmanData[salesmanId].count}{" "}
              prescriptions (${salesmanData[salesmanId].total})
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
