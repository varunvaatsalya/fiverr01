"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Loading from "./Loading";
import { credentials } from "../credentials";

function NewAdminForm({ setNewUserSection, setAdmins }) {
  // const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const onSubmit = async (data) => {
    setMessage(null);
    if (data.email == credentials.email) {
      setMessage("Email already exists");
    } else {
      setSubmitting(true);
      try {
        let result = await fetch("/api/admin", {
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
          setAdmins((prevAdmins) => [result.admin, ...prevAdmins]);
          setNewUserSection((prev) => !prev);
        } else {
          setMessage(result.message);
        }
      } catch (error) {
        console.error("Error submitting application:", error);
      } finally {
        setSubmitting(false);
      }
    }
  };
  return (
    <div>
      <h2 className="font-bold text-2xl text-white">
        Details of new <span className="text-blue-500">Admin</span>
      </h2>
      <hr className="border border-slate-800 w-full my-2" />
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="w-3/4 mx-auto my-2">
        <input
          id="email"
          type="email"
          placeholder={"Enter the Admin's email"}
          {...register("email", { required: "Email is required" })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.email ? "* " + errors.email.message : ""}
        </div>

        <input
          id="password"
          type="password"
          minLength={6}
          placeholder={"Set the Admin's password"}
          {...register("password", { required: "Password is required" })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />

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

export default NewAdminForm;
