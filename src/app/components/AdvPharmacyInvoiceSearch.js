"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

function AdvPharmacyInvoiceSearch({ setSearchedInvoices }) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const { register, handleSubmit, watch } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      let result = await fetch("/api/newPharmacyInvoice/advInvoiceSearch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify(data), // Properly stringify the data
      });

      // Parsing the response as JSON
      result = await result.json();
      // Check if login was successful
      if (result.success) {
        setSearchedInvoices(result.invoices);
      } else {
        setMessage(result.message);
        setTimeout(() => {
          setMessage("");
        }, 4500);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-wrap justify-center gap-3 px-3 py-6 border-t bg-slate-900 border-gray-800"
    >
      {message && (
        <div className="my-1 w-full text-center text-red-500">{message}</div>
      )}
      <input
        id="inid"
        type="text"
        placeholder={"Invoice ID"}
        {...register("inid")}
        className="mt-1 block text-white w-48 px-4 py-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      />
      <input
        id="patient name"
        type="text"
        placeholder={"patient name"}
        {...register("patientName")}
        className="mt-1 block text-white w-48 px-4 py-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      />
      <input
        id="uhid"
        type="text"
        placeholder={"UHID"}
        {...register("uhid")}
        className="mt-1 block text-white w-48 px-4 py-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      />
      <div className="flex flex-col lg:flex-row justify-center items-center gap-x-2">
        <label
          htmlFor="sdate"
          className=" text-sm lg:text-base font-medium text-gray-100"
        >
          Start Date
        </label>
        <input
          id="sdate"
          type="datetime-local"
          {...register("startDate")}
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
          type="datetime-local"
          {...register("endDate")}
          className="block text-white w-40 md:w-44 lg:w-48 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
      </div>
      <div className="flex flex-col lg:flex-row justify-center items-center gap-x-2">
        <label
          htmlFor="isReturn"
          className=" text-sm lg:text-base font-medium text-gray-100"
        >
          Return Invoices
        </label>
        <input
          id="isReturn"
          type="checkbox"
          checked={watch("isReturn")}
          {...register(`isReturn`)}
          className="size-6"
        />
      </div>
      <select
        id="paymentMode"
        {...register("paymentMode")}
        className="mt-1 block px-4 py-3 text-white w-48 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      >
        <option value="">-- Payment Mode --</option>
        <option value="Cash">Cash</option>
        <option value="UPI">UPI</option>
        <option value="Card">Card</option>
        <option value="Credit-Insurance">{"Credit (Insurance)"}</option>
        <option value="Credit-Doctor">{"Credit (Doctor)"}</option>
        <option value="Credit-Society">{"Credit (Society)"}</option>
        <option value="Credit-Others">{"Credit (Others)"}</option>
      </select>
      <button
        type="submit"
        className="px-3 py-1 flex items-center justify-center gap-2 bg-blue-500 rounded-lg font-semibold cursor-pointer text-white"
      >
        {submitting ? "Searching..." : "Search"}
      </button>
    </form>
  );
}

export default AdvPharmacyInvoiceSearch;
