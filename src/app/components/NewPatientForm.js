"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Loading from "./Loading";

function NewPatientForm({ setNewUserSection, setEntity }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [submitting, setSubmitting] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const isConfirmed = window.confirm(
        "Are you sure that this patient is not already registered?"
      );
      if (!isConfirmed) {
        setNewUserSection(false);
      }
    }, 400);
  
    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data) => {
    data.fathersName = prefix + data.fathersName;
    setSubmitting(true);
    try {
      let result = await fetch("/api/newPatient", {
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
        setEntity((prevPatient) => [result.patient, ...prevPatient]);
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
        Details of new <span className="text-blue-500">Patient</span>
      </h2>
      <hr className="border border-slate-800 w-full my-2" />
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[95%] px-2 md:w-4/5 lg:w-3/4 mx-auto my-2"
      >
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
        <div className="mt-1 flex gap-2 items-center">
          <select
            name="prefix"
            onChange={(e) => {
              setPrefix(e.target.value);
            }}
            className="text-white w-20 px-1 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
          >
            <option value="">prefix</option>
            <option value="S/o " title="Son of">
              S/o
            </option>
            <option value="W/o " title="Wife of">
              W/o
            </option>
            <option value="D/o " title="Daughter of">
              D/o
            </option>
            <option value="H/o " title="Husband of">
              H/o
            </option>
            <option value="F/o " title="Father of">
              M/o
            </option>
            <option value="M/o " title="Mother of">
              M/o
            </option>
          </select>
          <input
            id="fathersName"
            type="text"
            placeholder={"Enter the Patient's guardian Name"}
            onInput={(e) => (e.target.value = e.target.value.toUpperCase())}
            {...register("fathersName")}
            className=" text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
          />
        </div>
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

export default NewPatientForm;
