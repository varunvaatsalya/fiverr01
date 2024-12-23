"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";
import Loading from "./Loading";

function AddMedicineForm() {
  const [medicineDetailsSection, setMedicineDetailsSection] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [data, setData] = useState();
  const [manufacturers, setManufacturers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [medicineRepresentators, setMedicineRepresentators] = useState([]);
  const [salts, setSalts] = useState([]);

  useEffect(() => {
    fetch("/api/medicineMetaData")
      .then((res) => res.json())
      .then((data) => {
        setManufacturers(data.response.manufacturers);
        setVendors(data.response.vendors);
        setMedicineRepresentators(data.response.mrs);
        setSalts(data.response.salts);
      });
  }, []);

  const { register, handleSubmit, reset } = useForm();

  function onSubmit(data) {
    console.log(data);
    setData(data);
    setMedicineDetailsSection(true);
  }
  async function handleSave() {
    setSubmitting(true);
    try {
      let result = await fetch("/api/newMedicine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      result = await result.json();
      setMessage(result.message);
      if (result.success) {
        reset();
        setTimeout(() => {
          setMedicineDetailsSection(false);
        }, 2500);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  }
  const getManufacturerNameById = (id) => {
    console.log(id, "1")
    const manufacturer = manufacturers.find((m) => m._id === id);
    return manufacturer ? manufacturer.name : "Unknown Manufacturer";
  };
  const getVendorNameById = (id) => {
    console.log(id, "12")
    const vendor = vendors.find((m) => m._id === id);
    return vendor ? vendor.name : "Unknown Vendor";
  };
  const getMrNameById = (id) => {
    console.log(id, "123")
    const medicineRepresentator = medicineRepresentators.find(
      (m) => m._id === id
    );
    return medicineRepresentator
      ? [medicineRepresentator.name, medicineRepresentator.contact]
      : ["Unknown Medicine Representator", "Unknown Contact"];
  };
  const getSaltNameById = (id) => {
    console.log(id, "1234")
    const salt = salts.find((m) => m._id === id);
    return salt ? salt.name : "Unknown Salt";
  };
  return (
    <div className="w-[95%] md:w-4/5 lg:w-3/4 text-center border border-slate-800 rounded-xl mx-auto my-2">
      {medicineDetailsSection && (
        <div className="absolute top-0 left-0">
          <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
            <div className="w-[95%] md:w-4/5 lg:w-3/4 py-4 text-center bg-slate-950 px-4 rounded-xl">
              <h2 className="font-bold text-2xl text-blue-500">
                Medicine Details
              </h2>
              <hr className="border border-slate-800 w-full my-2" />
              {message && (
                <div className="my-1 text-center text-red-500">{message}</div>
              )}
              <div className="font-semibold text-white space-y-1 w-full md:w-1/2 mx-auto text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <div className="w-2/5 flex justify-between">
                    <div className="">Manufacturer</div>
                    <div className="">:</div>
                  </div>
                  <span className="text-blue-500">
                    {getManufacturerNameById(data.manufacturer)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2/5 flex justify-between">
                    <div className="">Vendor</div>
                    <div className="">:</div>
                  </div>
                  <span className="text-blue-500">
                    {getVendorNameById(data.vendor)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2/5 flex justify-between">
                    <div className="">Name</div>
                    <div className="">:</div>
                  </div>
                  <span className="text-blue-500">{data.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2/5 flex justify-between items-center">
                    <div className="">Medical Representator</div>
                    <div className="">:</div>
                  </div>
                  <span className="text-blue-500">
                    {getMrNameById(data.medicalRepresentator)[0] +
                      " - " +
                      getMrNameById(data.medicalRepresentator)[1]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2/5 flex justify-between">
                    <div className="">Salts</div>
                    <div className="">:</div>
                  </div>
                  <span className="text-blue-500">
                    {getSaltNameById(data.salts)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2/5 flex justify-between">
                    <div className="">Box Size</div>
                    <div className="">:</div>
                  </div>
                  <span className="text-blue-500">
                    {data.packetSize.tabletsPerStrip +
                      " Nos/Strip, & " +
                      data.packetSize.strips +
                      " Strips"}
                  </span>
                </div>
              </div>

              <hr className="border border-slate-800 w-full my-2" />
              <div className="flex px-4 gap-3 justify-end">
                <div
                  className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
                  onClick={() => {
                    setMedicineDetailsSection(false);
                  }}
                >
                  Cancel
                </div>
                <button
                  onClick={handleSave}
                  className="w-20 h-8 py-1 flex items-center justify-center gap-2 bg-green-500 rounded-lg font-semibold cursor-pointer text-white"
                  disabled={submitting}
                >
                  {submitting ? <Loading size={15} /> : <></>}
                  {submitting ? "Wait..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="text-center py-2 rounded-t-xl bg-slate-800 text-xl font-medium">
        Add Medicine
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="p-2">
        <label
          className="block font-semibold text-gray-900"
          htmlFor="manufacturer"
        >
          Select Manufacturer
        </label>
        <select
          id="manufacturer"
          {...register("manufacturer", {
            required: "Manufacturer is required",
          })}
          className="mt-1 block px-4 py-3 text-white w-full md:w-3/4 mx-auto bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">-- Select a Manufacturer --</option>
          {manufacturers.map((Manufacturer, index) => (
            <option key={index} value={Manufacturer._id}>
              {Manufacturer.name}
            </option>
          ))}
        </select>
        <label className="block font-semibold text-gray-900" htmlFor="Vendor">
          Select Vendor
        </label>
        <select
          id="Vendor"
          {...register("vendor", { required: "Vendor is required" })}
          className="mt-1 block px-4 py-3 text-white w-full md:w-3/4 mx-auto bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">-- Select a Vendor --</option>
          {vendors.map((Vendor, index) => (
            <option key={index} value={Vendor._id}>
              {Vendor.name}
            </option>
          ))}
        </select>
        <div className="block font-semibold text-gray-900">Medicine Name</div>
        <div className="flex justify-center items-center text-gray-800 py-1">
          <input
            type="text"
            name="name"
            placeholder="Medicine Name"
            {...register("name", { required: "Name is required" })}
            className="p-2 rounded-xl w-full md:w-3/4 bg-gray-300 text-gray-900"
          />
        </div>
        <label
          className="block font-semibold text-gray-900"
          htmlFor="Medical Representator"
        >
          Select Medical Representator
        </label>
        <select
          id="Medical Representator"
          {...register("medicalRepresentator", {
            required: "Medical Representator is required",
          })}
          className="mt-1 block px-4 py-3 text-white w-full md:w-3/4 mx-auto bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">-- Select a Medical Representator --</option>
          {medicineRepresentators.map((mr, index) => (
            <option key={index} value={mr._id}>
              {mr.name}
            </option>
          ))}
        </select>
        <label className="block font-semibold text-gray-900" htmlFor="Salts">
          Select Salts
        </label>
        <select
          id="Salts"
          {...register("salts", { required: "Salts is required" })}
          className="mt-1 block px-4 py-3 text-white w-full md:w-3/4 mx-auto bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">-- Select a Salts --</option>
          {salts.map((mr, index) => (
            <option key={index} value={mr._id}>
              {mr.name + " - " + mr.rxn}
            </option>
          ))}
        </select>
        <div className="block font-semibold text-gray-900">Select Box Size</div>
        <div className="flex justify-center items-center text-gray-800 py-1">
          <input
            type="number"
            {...register("packetSize.tabletsPerStrip", {
              required: "Tablets Size is required",
            })}
            placeholder="Tablets/S"
            className="p-2 rounded-xl w-36 bg-gray-300"
            min={1}
          />
          <div className="p-2 text-xl font-semibold">
            <RxCross2 />
          </div>
          <input
            type="number"
            {...register("packetSize.strips", {
              required: "Strip Size is required",
            })}
            placeholder="Strips/B"
            className="p-2 rounded-xl w-36 bg-gray-300"
            min={1}
          />
        </div>

        <div className="w-full md:w-3/4 mx-auto flex justify-center itmes-center my-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-800 py-2 px-4 rounded-xl font-semibold"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddMedicineForm;
