"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

function AdvPatientSearch({ setSearchedPatient }) {
  const { register, handleSubmit } = useForm();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      let result = await fetch("/api/advPatientSerch", {
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
        setSearchedPatient(result.patients);
      } else {
        setMessage(result.message);
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
      className="w-full flex flex-wrap justify-center gap-3 p-3 border-t bg-slate-900 border-gray-800"
    >
      {message && (
        <div className="my-1 w-full text-center text-red-500">{message}</div>
      )}
      <input
        id="name"
        type="text"
        placeholder={"name"}
        {...register("name")}
        className="mt-1 block text-white w-48 px-4 py-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      />
      <input
        id="fathersName"
        type="text"
        placeholder={"Father Name"}
        {...register("fathersName")}
        className="mt-1 block text-white w-48 px-4 py-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      />
      <select
        id="gender"
        type="text"
        {...register("gender")}
        className="mt-1 block text-white w-48 px-4 py-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      >
        <option value="">Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <input
        id="ageFrom"
        type="number"
        placeholder={"From Age"}
        {...register("ageFrom")}
        className="mt-1 block text-white w-32 px-4 py-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      />
      <input
        id="ageTo"
        type="number"
        placeholder={"To Age"}
        {...register("ageTo")}
        className="mt-1 block text-white w-32 px-4 py-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      />
      <input
        id="uhid"
        type="text"
        placeholder={"UHID"}
        {...register("uhid")}
        className="mt-1 block text-white w-48 px-4 py-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      />
      <input
        id="mobileNumber"
        type="number"
        placeholder={"Mobile No."}
        {...register("mobileNumber")}
        className="mt-1 block text-white w-48 px-4 py-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      />
      <input
        id="aadharNumber"
        type="number"
        placeholder={"Aadhar No."}
        {...register("aadharNumber")}
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
          type="date"
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
          type="date"
          {...register("endDate")}
          className="block text-white w-40 md:w-44 lg:w-48 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
      </div>
      <div className="flex flex-col lg:flex-row justify-center items-center gap-x-2">
        <label
          htmlFor="sdate"
          className=" text-sm lg:text-base font-medium text-gray-100"
        >
          Start Time
        </label>
        <input
          id="startTime"
          type="time"
          {...register("startTime")}
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
          id="endTime"
          type="time"
          {...register("endTime")}
          className="block text-white w-40 md:w-44 lg:w-48 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
      </div>

      <button
        type="submit"
        className="px-3 py-1 flex items-center justify-center gap-2 bg-blue-500 rounded-lg font-semibold cursor-pointer text-white"
      >
        {submitting?'Searching...':'Search'}
      </button>
      <div className="w-full text-center text-red-500">
        If you are searching by date then you must provide both start date and
        end date.
      </div>
    </form>
  );
}

export default AdvPatientSearch;
