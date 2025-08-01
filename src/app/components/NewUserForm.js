"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { showError, showSuccess } from "@/app/utils/toast";
import Loading from "./Loading";

function NewUserForm({ setNewUserSection, role, updateUsers, editUserId }) {
  // const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    async function fetchUser() {
      let res = await fetch(`/api/newUsers?id=${editUserId}`);
      res = await res.json();
      if (res.success) {
        reset(res.user);
      } else {
        showError("user not found");
        setNewUserSection(false);
      }
    }
    if (editUserId) fetchUser();
  }, [editUserId]);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      let result = await fetch("/api/newUsers", {
        method: editUserId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify({ ...data, role }), // Properly stringify the data
      });

      // Parsing the response as JSON
      result = await result.json();
      // Check if login was successful
      if (result.success) {
        if (editUserId) {
          updateUsers((prevUsers) =>
            prevUsers.map((user) =>
              user._id === editUserId ? result.user : user
            )
          );
        } else {
          updateUsers((prevUsers) => [result.user, ...prevUsers]);
        }

        setNewUserSection((prev) => !prev);
        showSuccess(result.message);
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
        Details of {editUserId ? "edit" : "new"}{" "}
        <span className="text-blue-500">{role}</span>
      </h2>
      <hr className="border border-slate-800 w-full my-2" />
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="w-3/4 mx-auto my-2">
        <input
          id="name"
          type="text"
          placeholder={"Enter the " + role + "'s name"}
          {...register("name", { required: "Name is required" })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.name ? "* " + errors.name.message : ""}
        </div>
        <input
          id="email"
          type="email"
          placeholder={"Enter the " + role + "'s email"}
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
          placeholder={"Set the " + role + "'s password (min 6 char)"}
          {...register("password", { required: "Password is required" })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        {(role == "salesman" || role == "stockist" || role == "dispenser") && (
          <>
            <div className=" py-1 text-sm text-blue-500 text-start px-2">
              Permission of Edit Invoice
            </div>
            <select
              id="editPermission"
              {...register("editPermission", {
                required: "editPermission is required",
              })}
              className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
            >
              <option value={false}>Not Granted</option>
              <option value={true}>Granted</option>
            </select>
          </>
        )}
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.role ? "* " + errors.role.message : ""}
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
            {submitting ? "Wait..." : editUserId ? "Update" : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewUserForm;
