"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Loading from "./Loading";

function NewDoctorForm({ setNewUserSection, setEntity }) {
  // const router = useRouter();
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/department?name=1");
        result = await result.json();
        if (result.success) {
          setDepartments(result.departments);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);


  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      let result = await fetch("/api/newDoctor", {
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
        setEntity((prevDoctors) => [result.doctor, ...prevDoctors]);
        setNewUserSection((prev) => !prev);
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
    <div>
      <h2 className="font-bold text-2xl text-white">
        Details of new <span className="text-blue-500">Doctors</span>
      </h2>
      <hr className="border border-slate-800 w-full my-2" />
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="w-3/4 mx-auto my-2">
        <input
          id="name"
          type="text"
          placeholder={"Enter the Doctors's name"}
          {...register("name", { required: "Name is required" })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.name ? "* " + errors.name.message : ""}
        </div>
        <input
          id="email"
          type="email"
          placeholder={"Enter the Doctor's email"}
          {...register("email", { required: "Email is required" })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.email ? "* " + errors.email.message : ""}
        </div>
        <input
          id="specialty"
          type="text"
          placeholder={"Enter the Doctors's Specialty"}
          {...register("specialty", { required: "Specialty is required" })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.specialty ? "* " + errors.specialty.message : ""}
        </div>

        <div className="mb-4">
        <label className="block font-semibold mb-2" htmlFor="department">
          Select Department
        </label>
        <select
          id="department"
          {...register("department", { required: "Department is required" })}
          className="mt-1 block px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">-- Select a Department --</option>
          {departments.map((department, index) => (
            <option key={index} value={department._id}>
              {department.name}
            </option>
          ))}
        </select>
      </div>

        <hr className="border border-slate-800 w-full my-2" />
        <div className="flex px-4 gap-3 justify-end">
          <div
            className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
            onClick={() => {
              setNewUserSection((prev) => !prev);
            }}
          >
            Cancel
          </div>
          <button
            type="submit"
            className="w-20 h-8 py-1 flex items-center justify-center gap-2 bg-red-500 rounded-lg font-semibold cursor-pointer text-white"
            disabled={submitting}
          >
            {submitting ? <Loading size={15} /> : <></>}
            {submitting ? "Wait..." : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewDoctorForm;
