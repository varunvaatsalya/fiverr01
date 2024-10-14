"use client";
import React, { useEffect, useState } from "react";
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
  setEntity,
  editPrescription,
  setEditPrescription,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [details, setDetails] = useState(null);

  const { register, handleSubmit, setValue } = useForm();

  const [selectedDepartment, setSelectedDepartment] = useState(
    editPrescription.department._id
  );
  const [availableItems, setAvailableItems] = useState([]);
  // details.departments.find(
  //   (department) => department._id === editPrescription.department._id
  // ).items;
  const [selectedItems, setSelectedItems] = useState(editPrescription.items);

  useEffect(() => {
    setValue("_id", editPrescription._id);
    setValue("patient", editPrescription.patient._id);
    setValue("department", editPrescription.department._id);
    setValue("doctor", editPrescription.doctor._id);
    setValue("items", editPrescription.items);
    setValue("paymentMode", editPrescription.paymentMode);
  }, [editPrescription]);

  useEffect(() => {
    setValue("items", selectedItems);
  }, [selectedItems]);

  useEffect(() => {
    // if (selectedDepartment !== editPrescription.department._id) {
    setSelectedItems([]);
    setValue("doctor", "");
    console.log(selectedDepartment)
    // }
  }, [selectedDepartment]);
  
  useEffect(() => {
    if (details?.departments) {
      const department = details.departments.find(
        (department) => department._id === selectedDepartment
      );
      if (department) {
        setAvailableItems(department.items);
      }else{
        setAvailableItems([]);

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
    console.log(data);
    if (selectedItems.length > 0) {
      setMessage(null);
      setSubmitting(true);
      try {
        console.log(data, selectedItems.length);
        let result = await fetch("/api/newPrescription", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json", // Set the header for JSON
          },
          body: JSON.stringify(data), // Properly stringify the data
        });

        // Parsing the response as JSON
        result = await result.json();
        // Check if login was successful
        if (result.success) {
          setEntity((prevPrescription) =>
            prevPrescription.map((prescription) =>
              prescription._id === result.prescription._id ? result.prescription : prescription
            )
          );
          setEditPrescription(null);
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
        edit the <span className="text-blue-500">Prescription</span>
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
          console.log(e.target.value);
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
      <select
        id="department"
        {...register("department", { required: "department is required" })}
        onChange={(e) => {
          console.log(e.target.value)
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

      {/* Display items if a department is selected */}
      {editPrescription?.department && (
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
            <h3 className="text-md font-semibold mb-2">Selected Items:</h3>
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
        <select
          id="paymentMode"
          {...register("paymentMode", { required: "Payment Mode is required" })}
          className="mt-1 mb-4 block px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">-- Payment Mode --</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Card">Card</option>
        </select>
      )}

      {/* Submit Button */}
      <hr className="border border-slate-800 w-full my-2" />
      <div className="flex px-4 gap-3 justify-end">
        <div
          className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
          onClick={() => {
            setEditPrescription(null);
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
