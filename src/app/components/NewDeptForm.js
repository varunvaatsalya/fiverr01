"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Loading from "./Loading";

const NewDeptForm = ({ setNewUserSection, setDepartments }) => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "", // Department name
      items: [], // No items initially
    },
  });

  // useFieldArray to manage dynamic items
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  // Handle form submission
  const onSubmit = async (data) => {
    reset(); // Reset the form after submission
    setSubmitting(true);
    try {
      let result = await fetch("/api/department", {
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
        setDepartments((prevDepartments) => [result.department, ...prevDepartments]);
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full md:w-4/5 lg:w-3/4 max-h-[80vh] overflow-auto mx-auto px-2 my-2"
    >
      {/* Department Name */}
      <h2 className="font-bold text-2xl text-white">
        Details of new <span className="text-blue-500">Department</span>
      </h2>
      <hr className="border border-slate-800 w-full my-2" />
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}
      <div className="mb-4">
        <input
          {...register("name", { required: true })}
          type="text"
          id="name"
          onChange={(e) => e.target.value = e.target.value.toLowerCase()}
          className="mt-1 block px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
          placeholder="Enter department name"
        />
        <div className="text-sm text-gray-600 text-start">* Department names must be typed in lowercase only.</div>
      </div>

      {/* Items (item name and price) */}
      <div>
        <h3 className="font-semibold text-lg mb-2 text-gray-100">Items</h3>
        {fields.length === 0 && (
          <p className="text-gray-500">
            No items added yet. Click <u>Add Item</u>  to start.
          </p>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center mb-4 space-x-4">
            {/* Item Name */}
            <div className="flex-1">
              <input
                {...register(`items[${index}].name`, { required: true })}
                type="text"
                placeholder="Item Name"
                className=" px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
              />
            </div>

            {/* Price */}
            <div className="w-24">
              <input
                {...register(`items[${index}].price`, { required: true })}
                type="number"
                placeholder="Price"
                className=" px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
              />
            </div>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500 font-semibold hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}

        {/* Add New Item Button */}
        <button
          type="button"
          onClick={() => append({ name: "", price: "" })}
          className="p-2 bg-blue-500 rounded-lg font-semibold text-white"
        >
          Add Item
        </button>
      </div>

      {/* Submit Button */}
      <hr className="border border-slate-800 w-full my-2" />
      <div className="flex px-4 gap-3 justify-end">
        <button
          className="p-2 border text-white border-slate-700 rounded-lg font-semibold"
          onClick={() => {
            setNewUserSection((prev) => !prev);
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="p-2 bg-red-500 rounded-lg font-semibold text-white"
          disabled={submitting}
        >
          {submitting ? <Loading size={15} /> : <></>}
          {submitting ? "Wait..." : "Confirm"}
        </button>
      </div>
    </form>
  );
};

export default NewDeptForm;
