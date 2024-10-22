"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Loading from "./Loading";

function AddUnitSection({ setNewUserSection, setUnits }) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      units: [], // No items initially
    },
  });

  // useFieldArray to manage dynamic items
  const { fields, append, remove } = useFieldArray({
    control,
    name: "units",
  });
  // Handle form submission
  const onSubmit = async (data) => {
    reset();
    setSubmitting(true);
    try {
      let result = await fetch("/api/units", {
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
        setUnits((prevUnits) => [...result.Units, ...prevUnits]);
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
    <>
      <div className="absolute top-0 left-0">
        <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
          <div className="w-[95%] md:w-1/2 py-4 text-center bg-slate-950 px-4 rounded-xl">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full md:w-4/5 lg:w-3/4 max-h-[80vh] overflow-auto mx-auto px-2 my-2"
            >
              {/* Department Name */}
              <h2 className="font-bold text-2xl text-white">
                New <span className="text-blue-500">Units</span>
              </h2>
              <hr className="border border-slate-800 w-full my-2" />
              {message && (
                <div className="my-1 text-center text-red-500">{message}</div>
              )}

              {/* Items (item name and price) */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Units</h3>
                {fields.length === 0 && (
                  <p className="text-gray-500">
                    No items added yet. Click <u>Add Item</u> to start.
                  </p>
                )}

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center mb-4 space-x-4"
                  >
                    {/* Item Name */}
                    <div className="flex-1">
                      <input
                        {...register(`units[${index}].name`, {
                          required: true,
                        })}
                        type="text"
                        placeholder="Item Name"
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
                  onClick={() => append({ name: "" })}
                  className="p-2 bg-blue-500 rounded-lg font-semibold text-white"
                >
                  Add Unit
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
                  className="p-2 bg-red-500 rounded-lg font-semibold text-white flex gap-2 justify-center items-center"
                  disabled={submitting}
                >
                  {submitting ? <Loading size={15} /> : <></>}
                  {submitting ? "Wait..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddUnitSection;
