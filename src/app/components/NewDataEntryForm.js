"use client";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Loading from "./Loading";


const NewDataEntryForm = ({ setNewUserSection, setEntity }) => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [details, setDetails] = useState(null);

  const { register, handleSubmit, setValue } = useForm();

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  useEffect(() => {
    setValue("items", selectedItems);
  }, [selectedItems]);

  useEffect(() => {
    setSelectedItems([]);
  }, [selectedDepartment]);

  useEffect(() => {
    if (details?.departments && selectedDepartment) {
      const department = details.departments.find(
        (department) => department._id === selectedDepartment
      );
      if (department) {
        setAvailableItems(department.items.sort((a, b) => a.name.localeCompare(b.name)));
      }
    }
  }, [selectedDepartment, details]);

  //   // Handle form submission

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newPrescription?componentDetails=1");
        result = await result.json();
        if (result.success) {
          setDetails({
            patients: result.patients,
            doctors: result.doctors,
            departments: result.departments,
          });
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    if (selectedItems.length > 0) {
      setMessage(null);
      setSubmitting(true);
      try {
        console.log(data, selectedItems.length);
        let result = await fetch("/api/newDataEntry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        result = await result.json();
        if (result.success) {
          setEntity((prevDataEntry) => [
              ...prevDataEntry,
              result.newDataEntry,
          ]);
          setNewUserSection((prev) => !prev);
        } else {
          setMessage(result.message);
        }
      } catch (error) {
        console.error("Error submitting application:", error);
      } finally {
        setSubmitting(false);
      }
    } else {
      setMessage("choose atleast one items");
    }
  };

  // Handle item selection via checkbox
  const handleItemSelection = (item, isChecked) => {
    if (isChecked) {
      setSelectedItems([...selectedItems, item]); // Add item to selected items
    } else {
      setSelectedItems(
        selectedItems.filter((selectedItem) => selectedItem.name !== item.name)
      ); // Remove item by name
    }
  };

  if (!details)
    return (
      <div className="p-4 flex justify-center">
        <Loading size={50} />
      </div>
    );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-[90%] md:w-4/5 lg:w-3/4 max-h-[80vh] overflow-auto mx-auto px-2 my-2"
    >
      {/* Department Selection */}
      <h2 className="font-bold text-2xl text-white">
        New <span className="text-blue-500">Desk Entry</span>
      </h2>
      <hr className="border border-slate-800 w-full my-2" />
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}
      <select
        id="patient"
        {...register("patient", { required: "patient is required" })}
        onChange={(e) => {
          setSelectedPatient(e.target.value);
        }}
        className="mt-1 mb-4 block px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      >
        <option value="">-- Select Patient --</option>
        {details.patients.map((patient, index) => (
          <option key={index} value={patient._id}>
            {patient.name + ", UHID: " + patient.uhid}
          </option>
        ))}
      </select>
      {selectedPatient && (
        <select
          id="department"
          {...register("department", { required: "department is required" })}
          onChange={(e) => {
            setSelectedDepartment(e.target.value);
          }}
          className="mt-1 mb-4 block px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">-- Select a Department --</option>
          {details.departments.map((department, index) => (
            <option key={index} value={department._id}>
              {department.name}
            </option>
          ))}
        </select>
      )}

      {/* Display items if a department is selected */}
      {selectedDepartment && selectedPatient && (
        <>
          <select
            id="doctor"
            {...register("doctor", { required: "doctor is required" })}
            className="mt-1 mb-4 block px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
          >
            <option value="">-- Select a Doctor --</option>
            {details.doctors
              .filter((doctor) => doctor.department === selectedDepartment)
              .map((doctor, index) => (
                <option key={index} value={doctor._id}>
                  {doctor.name}
                </option>
              ))}
          </select>

          <div className="mb-6">
            {availableItems.length > 0 ? (
              availableItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center mb-4 justify-center space-x-2"
                >
                  <input
                    type="checkbox"
                    id={`item-checkbox-${index}`}
                    checked={selectedItems.some(
                      (selectedItem) => selectedItem.name === item.name
                    )} // <-- Corrected: Check if item is selected based on name
                    onChange={(e) =>
                      handleItemSelection(item, e.target.checked)
                    }
                    className="block size-5 bg-red-600 border-gray-800 rounded focus:ring-blue-800 focus:ring-2"
                  />

                  {/* Display item name */}
                  <label
                    htmlFor={`item-checkbox-${index}`}
                    className="text-gray-400 bg-gray-700 rounded px-2"
                  >
                    {item.name} (Price: {item.price})
                  </label>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                No items available for this department.
              </p>
            )}
          </div>

          {/* Render selected items dynamically using useFieldArray */}
          <div>
            <h3 className="text-md font-semibold mb-2 text-gray-100">Selected Items:</h3>
            {selectedItems.map((selectedItem, index) => (
              <div
                key={index}
                className="flex items-center mb-4 space-x-2 lg:space-x-4"
              >
                {/* Item Name */}
                <div className="flex-1">
                  <input
                    {...register(`items[${index}].name`)}
                    type="text"
                    defaultValue={selectedItem.name}
                    className="px-4 py-2 bg-gray-700 text-gray-300 outline-none w-full rounded-lg shadow-sm"
                    readOnly
                  />
                </div>

                {/* Item Price */}
                <div className="w-20">
                  <input
                    {...register(`items[${index}].price`)}
                    type="number"
                    defaultValue={selectedItem.price}
                    className="px-2 py-2 bg-gray-700 text-gray-300 outline-none w-full rounded-lg shadow-sm"
                    readOnly
                  />
                </div>

                {/* Delete button to remove the selected item */}
                <button
                  type="button"
                  onClick={() => handleItemSelection(selectedItem, false)} // Uncheck the item
                  className="text-red-500 font-semibold hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      {selectedItems.length > 0 && (
          <p className="font-semibold text-lg text-gray-100">
            Grand Total: ₹{" "}
            {selectedItems?.reduce((sum, item) => sum + item.price, 0)}
          </p>
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

export default NewDataEntryForm;