"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import Loading from "../../../../components/Loading";

function Page({ params }) {
  const id = params.id;
  const [submitting, setSubmitting] = useState(false);
  const [units, setUnits] = useState([]);
  const [message, setMessage] = useState(null);

  const { register, control, handleSubmit, setValue } = useForm({
    defaultValues: {
      name: "",
      price: null,
      items: [], // No items initially
    },
  });

  // useFieldArray to manage dynamic items
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitResult, labTestResult] = await Promise.all([
          fetch("/api/units").then((res) => res.json()),
          fetch(`/api/pathologyLabTest?id=${id}`).then((res) => res.json()),
        ]);

        if (unitResult.success) {
          setUnits(unitResult.units);
        }

        if (labTestResult.success) {
          setValue("items", labTestResult.pathologyLabTest.items);
          setValue("name", labTestResult.pathologyLabTest.name);
          setValue("price", labTestResult.pathologyLabTest.price);
        }
        console.log(labTestResult.pathologyLabTest, unitResult.units);
      } catch (err) {
        console.error("error:", err);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    console.log({ ...data, id });
    setSubmitting(true);
    try {
      let result = await fetch("/api/pathologyLabTest", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify({ ...data, id }), // Properly stringify the data
      });

      result = await result.json();
      setMessage(result.message);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-black min-h-screen p-4 text-center w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full md:w-4/5 lg:w-3/4 mx-auto px-2 my-2"
      >
        {/* Department Name */}
        <h2 className="font-bold text-2xl text-white">
          Update <span className="text-blue-500">Lab Test</span>
        </h2>
        <hr className="border border-slate-800 w-full my-2" />
        <div className="mb-4 md:flex gap-2">
          <div className="w-full md:w-3/4">
            <input
              {...register("name", { required: true })}
              type="text"
              id="name"
              onChange={(e) => (e.target.value = e.target.value.toLowerCase())}
              className="mt-1 block px-4 h-12 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
              placeholder="Enter the Test Name"
            />
            <div className="text-sm text-gray-600 text-start">
              * Test names must be typed in lowercase only.
            </div>
          </div>
          <input
            {...register("price", { required: true })}
            type="number"
            id="price"
            className="mt-1 block px-4 h-12 text-white w-full md:w-1/4 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
            placeholder="Price"
          />
        </div>

        {/* Items (item name and price) */}
        <div>
          <h3 className="font-semibold text-lg mb-2 text-gray-100">Items</h3>
          {fields.length === 0 && (
            <p className="text-gray-500">
              No items added yet. Click <u>Add Item</u> to start.
            </p>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center mb-4 space-x-2">
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
                      <option key={index} value={unit.name}>
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
        {message && (
          <div className="my-1 text-center text-red-500">{message}</div>
        )}
        <hr className="border border-slate-800 w-full my-2" />
        <div className="flex px-4 gap-3 justify-end">
          <Link
            className="p-2 border text-white border-slate-700 rounded-lg font-semibold"
            href="/dashboard-pathologist/pathology/ConfigAddReport"
          >
            Cancel
          </Link>
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
  );
}

export default Page;
