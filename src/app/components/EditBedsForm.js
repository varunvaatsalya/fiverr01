"use client";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Loading from "./Loading";

const EditDeptForm = ({ setNewUserSection, wardBeds, setWardBeds, setMode }) => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const { register, control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      name: "", // Ward name
      beds: [], // Items array based on selected ward
    },
  });

  // useFieldArray to manage dynamic beds
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "beds",
  });

  // Store selected ward
  const [selectedWard, setSelectedWard] = useState(null);

  // Handle ward selection
  const handleWardChange = (event) => {
    const selectedName = event.target.value;
    const selectedwardbed = wardBeds.find((ward) => ward.name === selectedName);
    setSelectedWard(selectedwardbed);

    if (selectedwardbed) {
      setValue("name", selectedwardbed.name);
      replace(selectedwardbed.beds); // Replace items with the selected ward's items
    } else {
      reset(); // Reset if no ward selected
    }
  };

  useEffect(()=>{
    console.log(fields);
  },[selectedWard])

  // Handle form submission

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      let result = await fetch("/api/wardbed", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify({ ...data, _id: selectedWard._id }), // Properly stringify the data
      });

      // Parsing the response as JSON
      result = await result.json();
      // Check if login was successful
      if (result.success) {
        setWardBeds((prevWards) =>
          prevWards.map((ward) =>
            ward._id === selectedWard._id
              ? { ...ward, ...result.updatedWard }
              : ward
          )
        );
        setNewUserSection((prev) => !prev);
        setMode(null);
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
      {/* Ward Selection */}
      <h2 className="font-bold text-2xl text-white">
        edit the <span className="text-blue-500">Ward</span>
      </h2>
      <hr className="border border-slate-800 w-full my-2" />
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}
      <div className="mb-4">
        <label
          className="block font-semibold mb-2 text-gray-100"
          htmlFor="wards"
        >
          Select Ward
        </label>
        <select
          id="wards"
          onChange={handleWardChange}
          className="mt-1 block px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">-- Select a Ward --</option>
          {wardBeds
            .map((Ward, index) => (
              <option key={index} value={Ward.name}>
                {Ward.name}
              </option>
            ))}
        </select>
      </div>

      {/* Display items if a ward is selected */}
      {selectedWard && (
        <>
          <div className="mb-4">
            <label className="block font-semibold mb-2 text-gray-100">
              Ward Name
            </label>
            <input
              {...register("name")}
              type="text"
              className="px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
            />
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-100">Beds</h3>
            {fields.map((field, index) => (
              <div key={field.bedName} className="flex items-center mb-4 space-x-4">
                {/* Item Name */}
                <div className="flex-1">
                  <input
                    {...register(`beds[${index}].bedName`, { required: true })}
                    type="text"
                    defaultValue={field.bedName}
                    className="px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                  />
                </div>

                {/* Item Price */}
                <div className="w-24">
                  <input
                    {...register(`beds[${index}].price`, { required: true })}
                    type="number"
                    defaultValue={field.price} // Set default value for price
                    className="px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
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
              onClick={() => append({ bedName: "", price: "" })}
              className="p-2 bg-blue-500 rounded-lg font-semibold text-white"
            >
              Add Beds
            </button>
          </div>
        </>
      )}

      {/* Submit Button */}
      <hr className="border border-slate-800 w-full my-2" />
      <div className="flex px-4 gap-3 justify-end">
        <div
          className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
          onClick={() => {
            setNewUserSection((prev) => !prev);
            setMode(null);
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
  );
};

export default EditDeptForm;
