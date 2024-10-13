"use client";
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Loading from "./Loading";

const fakedetails = {
  patients: [
    { _id: "12345", name: "John Doe", uhid: "UH1234" },
    { _id: "67890", name: "Jane Smith", uhid: "UH5678" },
  ],
  doctors: [
    { _id: "54321", name: "Dr. Alice", department: "98765" },
    { _id: "09876", name: "Dr. Bob", department: "56789" },
  ],
  departments: [
    {
      _id: "98765",
      name: "Cardiology",
      itmes: [
        { name: "x-ray", price: 125 },
        { name: "x-mas", price: 5412 },
      ],
    },
    {
      _id: "56789",
      name: "Neurology",
      itmes: [
        { name: "x-ray", price: 125 },
        { name: "x-mas", price: 5412 },
      ],
    },
  ],
};

const NewPrescriptionForm = ({
  setNewUserSection,
  departments,
  setDepartments,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [details, setDetails] = useState(fakedetails);

  const { register, control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      name: "", // Department name
      items: [], // Items array based on selected department
    },
  });

  // useFieldArray to manage dynamic items
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  });

  // Store selected department
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Handle department selection
  const handleDepartmentChange = (event) => {
    const selectedName = event.target.value;
    const selectedDept = departments.find((dept) => dept.name === selectedName);
    setSelectedDepartment(selectedDept);

    // Set department name and replace items in form
    if (selectedDept) {
      setValue("name", selectedDept.name);
      replace(selectedDept.items); // Replace items with the selected department's items
    } else {
      reset(); // Reset if no department selected
    }
  };

  // Handle form submission

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      console.log(data);
      let result = await fetch("/api/updatedepartment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify({ ...data, _id: selectedDepartment._id }), // Properly stringify the data
      });

      // Parsing the response as JSON
      result = await result.json();
      // Check if login was successful
      if (result.success) {
        // setDepartments((prevDepartments) => [result.department, ...prevDepartments]);
        setDepartments((prevDepartments) =>
          prevDepartments.map((dept) =>
            dept._id === selectedDepartment._id
              ? { ...dept, ...result.updatedDepartment }
              : dept
          )
        );
        console.log(result.department);
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

  if (details)
    return (
      <div className="p-4 flex justify-center">
        <Loading size={50} />
      </div>
    );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-3/4 max-h-[80vh] overflow-auto mx-auto px-2 my-2"
    >
      {/* Department Selection */}
      <h2 className="font-bold text-2xl text-white">
        edit the <span className="text-blue-500">Department</span>
      </h2>
      <hr className="border border-slate-800 w-full my-2" />
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}
      <div className="mb-4">
        <label className="block font-semibold mb-2" htmlFor="department">
          Select Department
        </label>
        <select
          id="department"
          onChange={handleDepartmentChange}
          className="mt-1 block px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">-- Select a Department --</option>
          {departments.map((department, index) => (
            <option key={index} value={department.name}>
              {department.name}
            </option>
          ))}
        </select>
      </div>

      {/* Display items if a department is selected */}
      {selectedDepartment && (
        <>
          <div className="mb-4">
            <label className="block font-semibold mb-2">Department Name</label>
            <input
              {...register("name")}
              type="text"
              className="px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
            />
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Items</h3>
            {fields.map((field, index) => (
              <div key={field._id} className="flex items-center mb-4 space-x-4">
                {/* Item Name */}
                <div className="flex-1">
                  <input
                    {...register(`items[${index}].name`, { required: true })}
                    type="text"
                    defaultValue={field.name} // Set default value for item name
                    className="px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                  />
                </div>

                {/* Item Price */}
                <div className="w-24">
                  <input
                    {...register(`items[${index}].price`, { required: true })}
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
              onClick={() => append({ name: "", price: "" })}
              className="p-2 bg-blue-500 rounded-lg font-semibold text-white"
            >
              Add Item
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

export default NewPrescriptionForm;
