"use client";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar";
import { formatDateTimeToIST } from "@/app/utils/date";

const Analytics = ({
  prescriptions,
  departments,
  doctors,
  expenses,
  setData,
  dateRange,
  setDateRange,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState([]);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [showSubtotal, setShowSubtotal] = useState(false);
  const pressedKeys = useRef(new Set());

  const handleKeyDown = (event) => {
    pressedKeys.current.add(event.key.toLowerCase());

    // Check if Q + W + E + R are pressed
    if (
      pressedKeys.current.has("q") &&
      pressedKeys.current.has("w") &&
      pressedKeys.current.has("e") &&
      pressedKeys.current.has("r")
    ) {
      setShowSubtotal(true);
    }
  };

  // Track keyup events to reset keys
  const handleKeyUp = (event) => {
    pressedKeys.current.delete(event.key.toLowerCase());

    // Reset to default when Enter is pressed
    if (event.key === "Enter") {
      setShowSubtotal(false);
    }
  };

  // Attach event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      let result = await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify(dateRange),
        body: JSON.stringify({ startDateTime, endDateTime }),
      });

      result = await result.json();
      if (result.success) {
        setData((prevData) => ({
          ...prevData,
          prescriptions: result.prescriptions,
          expenses: result.expenses,
        }));
        setDateRange({ from: result.startDate, to: result.endDate });
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

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
    if (selectedPaymentMode) {
      filtered = filtered.filter((p) => p.paymentMode === selectedPaymentMode);
    }

    setFilteredPrescriptions(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [prescriptions, selectedDepartment, selectedDoctor, selectedPaymentMode]);

  // const getTotalAmount = () => {
  //   return filteredPrescriptions.reduce(
  //     (sum, p) => sum + p.items.reduce((sum, item) => sum + item.price, 0),
  //     0
  //   );
  // };

  const getTotalAmount = () => {
    return filteredPrescriptions.reduce((sum, p) => sum + p.price.total, 0);
  };
  const getSubTotalAmount = () => {
    return filteredPrescriptions.reduce((sum, p) => sum + p.price.subtotal, 0);
  };

  const paymentSummary = () => {
    const summary = {}; // Dynamic summary object

    filteredPrescriptions.forEach((p) => {
      const mode = p.paymentMode.toLowerCase(); // Ensure case consistency
      // const amount = p.price.total;
      const amount = showSubtotal ? p.price.subtotal : p.price.total;

      if (mode === "mixed" && Array.isArray(p.payments)) {
        p.payments.forEach((subPayment) => {
          const subMode = subPayment.type.toLowerCase();
          const subAmount = subPayment.amount;

          if (!summary[subMode]) {
            summary[subMode] = { count: 0, total: 0 };
          }

          summary[subMode].count += 1;
          summary[subMode].total += subAmount;
        });
      }

      if (!summary[mode]) {
        summary[mode] = { count: 0, total: 0 }; // Create if mode not exists
      }

      summary[mode].count += 1;
      summary[mode].total += amount;
    });

    return summary;
  };

  const departmentSummary = () => {
    const summary = {};
    filteredPrescriptions.forEach((p) => {
      const amount = showSubtotal ? p.price.subtotal : p.price.total;
      if (!summary[p.department.name]) {
        summary[p.department.name] = { count: 0, total: 0 };
      }
      summary[p.department.name].count += 1;
      summary[p.department.name].total += amount;
    });
    return summary;
  };

  const paymentData = paymentSummary();
  const departmentData = departmentSummary();
  // const salesmanData = salesmanSummary();

  return (
    <div className="bg-black min-h-screen">
      <Navbar route={["Analytics"]} />
      {message && (
        <div className="my-1 w-full text-center text-red-500">{message}</div>
      )}

      <div className="w-full flex flex-wrap justify-center gap-3 my-2">
        <div className="flex justify-center items-center px-3 py-2 gap-2 bg-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out">
          <label
            htmlFor="sdate"
            className=" text-sm lg:text-base font-semibold text-blue-200"
          >
            Start Date :
          </label>
          <input
            id="sdate"
            type="datetime-local"
            onChange={(e) => {
              setStartDateTime(e.target.value);
            }}
            className="block text-white focus:outline-none bg-transparent"
          />
        </div>
        <div className="flex justify-center items-center px-3 py-2 gap-2 bg-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out">
          <label
            htmlFor="edate"
            className=" text-sm lg:text-base font-semibold text-blue-200"
          >
            End Date :
          </label>
          <input
            id="edate"
            type="datetime-local"
            onChange={(e) => {
              setEndDateTime(e.target.value);
            }}
            className="block text-white bg-transparent focus:outline-none"
          />
        </div>
        <button
          onClick={onSubmit}
          className="px-3 py-2 my-2 flex items-center justify-center gap-2 bg-blue-500 rounded-lg font-semibold cursor-pointer text-white"
        >
          {submitting ? "Searching..." : "Search"}
        </button>
      </div>
      <div className="w-full flex flex-wrap items-center justify-center gap-2 bg-slate-800 p-3 text-gray-100">
        <select
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="block text-white w-full md:w-2/5 lg:w-52 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
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
          className="block text-white w-full md:w-2/5 lg:w-52 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">Select Doctor</option>
          {doctors.map((doc) => (
            <option key={doc._id} value={doc._id}>
              {doc.name}
            </option>
          ))}
        </select>
        {/* <select
          onChange={(e) => setSelectedSalesman(e.target.value)}
          className="block text-white w-full md:w-2/5 lg:w-52 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">Select Salesman</option>
          {salesmen.map((sales) => (
            <option key={sales._id} value={sales._id}>
              {sales.name}
            </option>
          ))}
        </select> */}
        <select
          onChange={(e) => setSelectedPaymentMode(e.target.value)}
          className="block text-white w-full md:w-2/5 lg:w-52 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">Select Payment Mode</option>
          <option value="Card">Card</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
        </select>
      </div>
      <div className="p-2 space-y-2">
        <div className="font-semibold text-center">Date Range</div>
        <div className="flex flex-wrap justify-center items-center gap-2">
          <div className="bg-blue-800 p-1 text-sm rounded text-white">
            From:{" "}
            <span className="font-semibold uppercase">
              {formatDateTimeToIST(dateRange.from)}
            </span>
          </div>
          <div className="bg-blue-800 p-1 text-sm rounded text-white">
            To:{" "}
            <span className="font-semibold uppercase">
              {formatDateTimeToIST(dateRange.to)}
            </span>
          </div>
        </div>
        <div className="w-full text-gray-100 flex flex-wrap justify-center text-2xl gap-x-5">
          <span>
            Prescriptions:{" "}
            <span className="font-bold">{filteredPrescriptions.length}</span>
          </span>
          <span>
            Total Amount:{" "}
            <span className="font-bold">
              {showSubtotal ? getSubTotalAmount() : getTotalAmount()}
            </span>
            /-
          </span>
          {/* Render filtered prescriptions if needed */}
        </div>
        <div className="w-full text-gray-100 flex flex-wrap justify-center text-2xl gap-x-5">
          <span>
            Expenses: <span className="font-bold">{expenses.length}</span>
          </span>
          <span>
            Total Amount:{" "}
            <span className="font-bold">
              {expenses.reduce((total, expense) => total + expense.amount, 0)}
            </span>
            /-
          </span>
        </div>
        {/* Render filtered prescriptions if needed */}
      </div>
      <div className="bg-slate-900 max-w-xl rounded-xl mx-auto text-gray-100 text-center">
        <h2 className="text-blue-300 text-2xl font-semibold py-1 border-b-2 border-gray-800">
          Analytics
        </h2>

        {/* Section 2: Payment Mode Summary */}
        <div className="border-b-2 border-gray-800 p-2">
          <h3 className="text-blue-100 text-lg font-semibold pb-1">
            Payment Mode Summary
          </h3>
          <div className="capitalize">
            {Object.keys(paymentData).map((mode) => (
              <p key={mode}>
                {mode}
                {": "}
                {paymentData[mode].count} ({" "}
                <span className="text-blue-500">
                  {parseFloat(paymentData[mode].total.toFixed(2))}/-
                </span>{" "}
                )
              </p>
            ))}
          </div>
        </div>

        {/* Section 3: Department Summary */}
        <div className="p-2">
          <h3 className="text-blue-100 text-lg font-semibold pb-1">
            Department Summary
          </h3>
          {Object.keys(departmentData).map((department) => (
            <p key={department}>
              {department}: {departmentData[department].count} prescriptions ({" "}
              {departmentData[department].total}/- )
            </p>
          ))}
        </div>

        {/* Section 4: Salesman Summary */}
        {/* <div className="section">
          <h3>Salesman Summary</h3>
          {Object.keys(salesmanData).map((salesmanId) => (
            <p key={salesmanId}>
              {salesmanData[salesmanId].name}: {salesmanData[salesmanId].count}{" "}
              prescriptions (${salesmanData[salesmanId].total})
            </p>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default Analytics;
