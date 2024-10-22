"use client"
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function AdvPrescSearch({ setSearchedPrescription }) {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const { register, handleSubmit } = useForm();

  useEffect(() => {
    async function fetchData() {
      try {
        let departmentResult = await fetch("/api/department?name=1");
        departmentResult = await departmentResult.json();
        if (departmentResult.success) {
          setDepartments(departmentResult.departments);
        }

        let doctorResult = await fetch("/api/newDoctor?name=1");
        doctorResult = await doctorResult.json();
        if (doctorResult.success) {
          setDoctors(doctorResult.doctors);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);

  //   advPrescSerch

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      let result = await fetch("/api/advPrescSerch", {
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
        setSearchedPrescription(result.prescriptions);
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
      <input
        id="pid"
        type="text"
        placeholder={"PID"}
        {...register("pid")}
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
      <select
        id="department"
        {...register("department")}
        className="mt-1 block px-4 py-3 text-white w-48 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      >
        <option value="">Select a Department</option>
        {departments.map((department, index) => (
          <option key={index} value={department._id}>
            {department.name}
          </option>
        ))}
      </select>
      <select
        id="doctors"
        {...register("doctor")}
        className="mt-1 block px-4 py-3 text-white w-48 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      >
        <option value="">Select a Doctor</option>
        {doctors.map((doctor, index) => (
          <option key={index} value={doctor._id}>
            {doctor.name}
          </option>
        ))}
      </select>
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

export default AdvPrescSearch;
