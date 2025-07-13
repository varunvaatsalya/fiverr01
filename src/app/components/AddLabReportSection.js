"use client";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Loading from "./Loading";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function AddLabReportSection({ setNewUserSection, setTests }) {
  const [submitting, setSubmitting] = useState(false);
  const [units, setUnits] = useState([]);
  const [message, setMessage] = useState(null);

  const units1 = [
    {
      name: "gm/ml",
    },
    {
      name: "mg/l",
    },
    {
      name: "f/ld",
    },
    {
      name: "mm3/mlgngr",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        let unitResult = await fetch("/api/units");
        unitResult = await unitResult.json();

        if (unitResult.success) {
          setUnits(unitResult.units);
        }
      } catch (err) {
        console.error("error:", err);
      }
    };

    fetchData();
  }, []);

  const { register, control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      name: "",
      price: null,
      items: [], // No items initially
      isExternalReport: false,
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
      let result = await fetch("/api/pathologyLabTest", {
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
        setTests((prevTests) => [result.newLabTest, ...prevTests]);
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
          <div className="w-[95%] md:w-3/4 py-4 text-center bg-slate-950 px-4 rounded-xl">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full md:w-4/5 lg:w-3/4 max-h-[80vh] overflow-auto mx-auto px-2 my-2"
            >
              {/* Department Name */}
              <h2 className="font-bold text-2xl text-white">
                Details of new <span className="text-blue-500">Test</span>
              </h2>
              <hr className="border border-slate-800 w-full my-2" />
              {message && (
                <div className="my-1 text-center text-red-500">{message}</div>
              )}
              <div className="mb-4 md:flex gap-2">
                <div className="w-full md:w-3/4">
                  <input
                    {...register("name", { required: true })}
                    type="text"
                    id="name"
                    className="mt-1 block px-4 h-12 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                    placeholder="Enter the Test Name"
                  />
                </div>
                <input
                  {...register("price", { required: true })}
                  type="number"
                  id="price"
                  className="mt-1 block px-4 h-12 text-white w-full md:w-1/4 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                  placeholder="Price"
                />
              </div>
              <Label htmlFor="isExternal" className="flex gap-2 items-center">
                <Checkbox
                  id="isExternal"
                  className="size-4 md:size-6 border border-white text-black data-[state=checked]:bg-white data-[state=checked]:text-black data-[state=unchecked]:bg-transparent data-[state=unchecked]:border-white"
                  checked={watch("isExternalReport")}
                  onCheckedChange={() => {
                    setValue("isExternalReport", !watch("isExternalReport"));
                  }}
                />
                Check It if Report is External
              </Label>

              {/* Items (item name and price) */}
              <div>
                <h3 className="font-semibold text-lg mb-2 text-gray-100">
                  Items
                </h3>
                {fields.length === 0 && (
                  <p className="text-gray-500">
                    No items added yet. Click <u>Add Item</u> to start.
                  </p>
                )}

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center mb-4 space-x-2"
                  >
                    {/* Item Name */}
                    <div className="flex-1">
                      <input
                        {...register(`items[${index}].name`, {
                          required: true,
                        })}
                        type="text"
                        placeholder="Item Name"
                        className=" px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                      />
                    </div>
                    <div className="w-1/5 min-w-24">
                      <input
                        {...register(`items[${index}].range`, {
                          required: true,
                        })}
                        type="text"
                        placeholder="Range"
                        className=" px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                      />
                    </div>

                    {/* Price */}
                    <div className="w-28">
                      <select
                        {...register(`items[${index}].unit`, {
                          required: true,
                        })}
                        className=" px-1 text-sm py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                      >
                        <option value="">Unit</option>
                        {units.map((unit, index) => {
                          return (
                            <option value={unit.name} key={index}>
                              {unit.name}
                            </option>
                          );
                        })}
                      </select>
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
                  onClick={() => append({ name: "", range: "", unit: "" })}
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
          </div>
        </div>
      </div>
    </>
  );
}

export default AddLabReportSection;
