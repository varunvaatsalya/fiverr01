"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Loading from "./Loading";

function EditPatientForm({
  setNewUserSection,
  setEntity,
  editPatient,
  setEditPatient,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  if (editPatient) {
    Object.entries(editPatient).forEach(([key, value]) => {
      setValue(key, value);
    });
  } else {
    reset(); // Reset if no patient selected
  }

  const onSubmit = async (data) => {
    console.log(data);
    setSubmitting(true);
    try {
      let result = await fetch("/api/newPatient", {
        method: "PUT", // Change method to PUT for updates
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify(data), // Properly stringify the data
      });

      // Parsing the response as JSON
      result = await result.json();

      // Check if update was successful
      if (result.success) {
        setEntity((prevPatients) =>
          prevPatients.map((patient) =>
            patient._id === result.patient._id ? result.patient : patient
          )
        );
        setEditPatient(null);
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
        Edit the <span className="text-blue-500">Patient</span>
      </h2>
      <hr className="border border-slate-800 w-full my-2" />
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="w-[95%] px-2 md:w-4/5 lg:w-3/4 mx-auto my-2">
        <input
          id="name"
          type="text"
          placeholder={"Enter the Patient's name"}
          onInput={(e) => (e.target.value = e.target.value.toUpperCase())}
          {...register("name", { required: "Name is required" })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.name ? "* " + errors.name.message : ""}
        </div>
        <input
          id="fathersName"
          type="text"
          placeholder={"Enter the Patient's fathersName"}
          onInput={(e) => (e.target.value = e.target.value.toUpperCase())}
          {...register("fathersName", { required: "Fathers Name is required" })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.fathersName ? "* " + errors.fathersName.message : ""}
        </div>
        <div className="w-full mt-1 flex justify-between gap-2">
          <input
            id="age"
            type="number"
            placeholder={"Enter the Age"}
            {...register("age", { required: "Age is required" })}
            className="block text-white w-2/5 px-2 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
          />

          <select
            id="gender"
            {...register("gender", { required: "Gender is required" })}
            className="block px-2 py-3 text-gray-100 w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
          >
            <option value="">-- Gender --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.age ? "* " + errors.age.message : ""}
        </div>
        <input
          id="mobileNumber"
          type="number"
          placeholder={"Enter the Patient's Mobile Number"}
          {...register("mobileNumber", {
            required: "Mobile Number is required",
          })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.mobileNumber ? "* " + errors.mobileNumber.message : ""}
        </div>
        <input
          id="aadharNumber"
          type="number"
          placeholder={"Aadhar Number (if available)"}
          {...register("aadharNumber")}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.aadharNumber ? "* " + errors.aadharNumber.message : ""}
        </div>

        <input
          id="address"
          type="text"
          placeholder={"Enter the Patient's address"}
          {...register("address", { required: "Address is required" })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.address ? "* " + errors.address.message : ""}
        </div>

        <hr className="border border-slate-800 w-full my-2" />
        <div className="flex px-4 gap-3 justify-end">
          <div
            className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
            onClick={() => {
              setEditPatient(null);
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
            {submitting ? "Wait..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPatientForm;
