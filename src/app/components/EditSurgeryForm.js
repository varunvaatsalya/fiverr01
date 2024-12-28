"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Loading from "./Loading";

function EditDoctorForm({
  setNewUserSection,
  setSurgerys,
  editSurgery,
  setEditSurgery,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  if (editSurgery) {
    setValue("name", editSurgery.name);
    setValue("price", editSurgery.price);
  } else {
    reset(); // Reset if no patient selected
  }

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      let result = await fetch("/api/ipditems?type=1", {
        method: "PUT", // Change method to PUT for updates
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify({ ...data, _id: editSurgery._id }), // Properly stringify the data
      });

      // Parsing the response as JSON
      result = await result.json();

      // Check if update was successful
      if (result.success) {
        setSurgerys((prevSurgerys) =>
          prevSurgerys.map((surgery) =>
            surgery._id === result.surgery._id ? result.surgery : surgery
          )
        );
        setEditSurgery(null);
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
        Edit the <span className="text-blue-500">Items</span>
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
          placeholder={"Enter the item's name"}
          {...register("name", { required: "Name is required" })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.name ? "* " + errors.name.message : ""}
        </div>
        <input
          id="price"
          type="number"
          placeholder={"Enter the item's price"}
          {...register("price", { required: "Price is required" })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.price ? "* " + errors.price.message : ""}
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

export default EditDoctorForm;
