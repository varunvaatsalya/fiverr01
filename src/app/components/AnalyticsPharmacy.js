"use client";
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";

const AnalyticsPharmacy = ({ pharmacyInvoices, setPharmacyInvoices }) => {
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [invoiceType, setInvoiceType] = useState("Today");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      let result = await fetch("/api/analyticsPharmacy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startDateTime, endDateTime }),
      });

      result = await result.json();
      if (result.success) {
        setPharmacyInvoices(result.pharmacyInvoices);
        setInvoiceType("Search");
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
    let filtered = pharmacyInvoices;

    if (selectedPaymentMode) {
      filtered = filtered.filter((p) => p.paymentMode === selectedPaymentMode);
    }
    setFilteredPrescriptions(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [pharmacyInvoices, selectedPaymentMode]);

  const totalDetails = () => {
    let totalCount = 0;
    let totalAmount = 0;
    let subtotalAmount = 0;
    let discountAmount = 0;
    let undeliveredAmount = 0;
    let undeliveredCount = 0;
    let discountCount = 0;

    // Process the invoices
    filteredPrescriptions.forEach((invoice) => {
      if (invoice.paymentMode.startsWith("Credit")) return;
      // Summing total, subtotal, and discount
      totalCount++;
      totalAmount += invoice.price.total || 0;
      subtotalAmount += invoice.price.subtotal || 0;
      discountAmount += invoice.price.subtotal - invoice.price.total || 0;

      // Counting undelivered invoices and summing their amount
      if (!invoice.isDelivered) {
        undeliveredAmount += invoice.price.total || 0;
        undeliveredCount++;
      }

      // Counting invoices with discount
      if (invoice.price.discount > 0) {
        discountCount++;
      }
    });

    return {
      totalCount,
      totalAmount,
      subtotalAmount,
      discountAmount,
      undeliveredAmount,
      undeliveredCount,
      discountCount,
    };
  };

  const paymentSummary = () => {
    const summary = {}; // Dynamic summary object

    filteredPrescriptions.forEach((p) => {
      const mode = p.paymentMode.toLowerCase(); // Ensure case consistency
      const amount = p.price.total;

      if (!summary[mode]) {
        summary[mode] = { count: 0, total: 0 }; // Create if mode not exists
      }

      summary[mode].count += 1;
      summary[mode].total += amount;
    });

    return summary;
  };

  const totalsData = totalDetails();
  const paymentData = paymentSummary();
  // const salesmanData = salesmanSummary();

  return (
    <div className="bg-black min-h-screen flex flex-col items-center">
      <div className="w-full">
        <Navbar route={["Pharmacy", "Analytics"]} />
      </div>
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
      <div className="font-bold text-xl text-center text-slate-300 bg-gray-800 rounded-lg py-1 px-3 my-1">
        {invoiceType}
      </div>
      <div className="w-full text-gray-100 flex flex-col items-center">
        <div className="flex justify-center gap-5 text-2xl">
          <span>
            No of Invoices:{" "}
            <span className="font-bold">{totalsData.totalCount}</span>
          </span>
          <span>
            Total Amount:{" "}
            <span className="font-bold">
              {parseFloat(totalsData.totalAmount.toFixed(2))}
            </span>
            /-
          </span>
        </div>
        <div className="flex justify-center gap-4">
          <div className="text-xl">
            No. of Discount Inv.: {totalsData.discountCount}
          </div>
          <div className="text-xl">
            Total Discount Amt:{" "}
            {parseFloat(totalsData.discountAmount.toFixed(2))}
          </div>
          <div className="text-xl">
            Sub Total: {parseFloat(totalsData.subtotalAmount.toFixed(2))}
          </div>
        </div>
        {
          <div className="flex justify-center gap-5 text-xl">
            <span>
              No of Undelivered Inv:{" "}
              <span className="font-bold">{totalsData.undeliveredCount}</span>
            </span>
            <span>
              Total Undelivered Inv Amt:{" "}
              <span className="font-bold">
                {parseFloat(totalsData.undeliveredAmount.toFixed(2))}
              </span>
              /-
            </span>
          </div>
        }
      </div>

      <div className="bg-slate-900 max-w-xl w-full rounded-xl mx-auto text-gray-100 text-center">
        <h2 className="text-blue-300 text-2xl font-semibold py-1 border-b-2 border-gray-800">
          Analytics
        </h2>

        {/* Section 2: Payment Mode Summary */}
        <div className="p-2">
          <h3 className="text-blue-100 text-lg font-semibold pb-1">
            Payment Mode Summary
          </h3>
          <div className="capitalize">
            {Object.keys(paymentData).map((mode) => (
              <p key={mode}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                {" - "}
                {paymentData[mode].count} ({" "}
                {parseFloat(paymentData[mode].total.toFixed(2))}/- )
              </p>
            ))}
          </div>
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

export default AnalyticsPharmacy;
