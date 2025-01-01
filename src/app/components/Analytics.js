"use client";
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";

const Analytics = ({
  prescriptions,
  departments,
  doctors,
  expenses,
  setData,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState([]);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    startTime: "00:00", // default start time
    endDate: "",
    endTime: "23:59", // default end time
  });
  console.log(prescriptions, 1111);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      let result = await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify(dateRange), // Properly stringify the data
      });

      result = await result.json();
      if (result.success) {
        setData((prevData) => ({
          ...prevData,
          prescriptions: result.prescriptions,
          expenses: result.expenses,
        }));
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // const handleFilter = () => {
  //   let filtered = prescriptions;

  //   // Get today's date in YYYY-MM-DD format
  //   const today = new Date().toISOString().slice(0, 10);

  //   if (selectedDepartment.length) {
  //     filtered = filtered.filter((p) =>
  //       selectedDepartment.includes(p.department._id)
  //     );
  //   }
  //   if (selectedDoctor.length) {
  //     filtered = filtered.filter((p) => selectedDoctor.includes(p.doctor._id));
  //   }
  //   if (selectedPaymentMode) {
  //     filtered = filtered.filter((p) => p.paymentMode === selectedPaymentMode);
  //   }

  //   // Filter by date and time
  //   if (dateRange.startTime || dateRange.endTime) {
  //     const startDateTime = new Date(
  //       `${dateRange.startDate || today}T${dateRange.startTime || "00:00"}`
  //     );
  //     const endDateTime = new Date(
  //       `${dateRange.endDate || today}T${dateRange.endTime || "23:59"}`
  //     );

  //     filtered = filtered.filter((p) => {
  //       const prescriptionDate = new Date(p.createdAt);
  //       return (
  //         prescriptionDate >= startDateTime && prescriptionDate <= endDateTime
  //       );
  //     });
  //   }

  //   setFilteredPrescriptions(filtered);
  // };

  const handleFilter = () => {
    let filtered = prescriptions;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today (midnight in IST)

    // Format today as "YYYY-MM-DD" using IST date
    const currentDate = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
    console.log("Today (IST):", today);
    console.log("currentDate (start of filter):", currentDate);

    let startDateTime = new Date(
      `${currentDate}T${dateRange.startTime || "00:00"}`
    );
    let endDateTime = new Date(
      `${currentDate}T${dateRange.endTime || "23:59"}`
    );

    console.log("Start DateTime (for filter):", startDateTime);
    console.log("End DateTime (for filter):", endDateTime);
    
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

    console.log("Start DateTime:", startDateTime);
    console.log("End DateTime:", endDateTime);

    filtered = filtered.filter((p) => {
      const prescriptionDate = new Date(p.createdAt); // Date the prescription was created
      console.log("Prescription Date:", prescriptionDate);
      return (
        prescriptionDate >= startDateTime && prescriptionDate <= endDateTime
      );
    });

    console.log("Filtered Prescriptions:", filtered);

    setFilteredPrescriptions(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [
    prescriptions,
    selectedDepartment,
    selectedDoctor,
    selectedPaymentMode,
    dateRange.startDate,
    dateRange.startTime,
    dateRange.endDate,
    dateRange.endTime,
  ]);

  // useEffect(() => {
  //   handleFilter();
  // }, [
  //   prescriptions,
  //   selectedDepartment,
  //   selectedDoctor,
  //   selectedPaymentMode,
  //   dateRange.startDate,
  //   dateRange.startTime,
  //   dateRange.endDate,
  //   dateRange.endTime,
  // ]);

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

  const paymentData = paymentSummary();
  const departmentData = departmentSummary();
  // const salesmanData = salesmanSummary();

  return (
    <div className="bg-black min-h-screen">
      <Navbar route={["Analytics"]} />
      {message && (
        <div className="my-1 w-full text-center text-red-500">{message}</div>
      )}
      <div className="w-full flex flex-wrap justify-center gap-2 bg-slate-800 p-4 text-gray-100">
        <select
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="mt-1 block text-white w-full md:w-2/5 lg:w-52 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
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
          className="mt-1 block text-white w-full md:w-2/5 lg:w-52 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
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
          className="mt-1 block text-white w-full md:w-2/5 lg:w-52 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
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
          className="mt-1 block text-white w-full md:w-2/5 lg:w-52 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">Select Payment Mode</option>
          <option value="Card">Card</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
        </select>
        <div className="w-full flex justify-center gap-x-3">
          <div className="flex flex-col lg:flex-row justify-center items-center gap-x-2">
            <label
              htmlFor="sdate"
              className=" text-sm lg:text-base font-medium text-gray-100"
            >
              Start Date
            </label>
            <input
              id="sdate"
              type="date"
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="block text-white w-40 md:w-44 lg:w-48 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
            />
          </div>
          <div className="flex flex-col lg:flex-row justify-center items-center gap-x-2">
            <label
              htmlFor="edate"
              className=" text-sm lg:text-base font-medium text-gray-100"
            >
              End Date
            </label>
            <input
              id="edate"
              type="date"
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="block text-white w-40 md:w-44 lg:w-48 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
            />
          </div>
        </div>
        <div className="w-full flex justify-center gap-x-3">
          <div className="flex flex-col lg:flex-row justify-center items-center gap-x-2">
            <label
              htmlFor="sdate"
              className=" text-sm lg:text-base font-medium text-gray-100"
            >
              Start Time
            </label>
            <input
              id="stime"
              type="time"
              onChange={(e) =>
                setDateRange({ ...dateRange, startTime: e.target.value })
              }
              className="block text-white w-40 md:w-44 lg:w-48 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
            />
          </div>
          <div className="flex flex-col lg:flex-row justify-center items-center gap-x-2">
            <label
              htmlFor="edate"
              className=" text-sm lg:text-base font-medium text-gray-100"
            >
              End Time
            </label>
            <input
              id="etime"
              type="time"
              onChange={(e) =>
                setDateRange({ ...dateRange, endTime: e.target.value })
              }
              className="block text-white w-40 md:w-44 lg:w-48 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
            />
          </div>
          <button
            onClick={onSubmit}
            className="px-3 py-1 flex items-center justify-center gap-2 bg-blue-500 rounded-lg font-semibold cursor-pointer text-white"
          >
            {submitting ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
      <div className="w-full text-gray-100 flex flex-wrap justify-center text-2xl p-2 gap-x-5">
        <span>
          Today&#39;s Prescriptions:{" "}
          <span className="font-bold">{filteredPrescriptions.length}</span>
        </span>
        <span>
          Total Amount: <span className="font-bold">{getTotalAmount()}</span>/-
        </span>
        {/* Render filtered prescriptions if needed */}
      </div>
      <div className="w-full text-gray-100 flex flex-wrap justify-center text-2xl p-2 gap-x-5">
        <span>
          Today&#39;s Expenses:{" "}
          <span className="font-bold">{expenses.length}</span>
        </span>
        <span>
          Total Amount:{" "}
          <span className="font-bold">
            {expenses.reduce((total, expense) => total + expense.amount, 0)}
          </span>
          /-
        </span>
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
          <p>
            Cash Payments: {paymentData.cash.count} ( {paymentData.cash.total}/-
            )
          </p>
          <p>
            UPI Payments: {paymentData.upi.count} ( {paymentData.upi.total}/- )
          </p>
          <p>
            Card Payments: {paymentData.card.count} ( {paymentData.card.total}/-
            )
          </p>
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
