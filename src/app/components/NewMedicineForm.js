"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";
import Loading from "./Loading";

function NewMedicineForm() {
  const [medicineDetailsSection, setMedicineDetailsSection] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [data, setData] = useState({});
  const [isTablets, setIsTablets] = useState(false);
  const [manufacturers, setManufacturers] = useState([]);
  // const [vendors, setVendors] = useState([]);
  const [salts, setSalts] = useState([]);
  const [editMedicineSection, setEditMedicineSection] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {}, [isTablets]);
  useEffect(() => {
    fetch("/api/medicineMetaData")
      .then((res) => res.json())
      .then((data) => {
        setManufacturers(data.response.manufacturers);
        // setVendors(data.response.vendors);
        setSalts(data.response.salts);
      });
  }, []);

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      isTablets: false,
      packetSize: {
        tabletsPerStrip: 1,
      },
    },
  });

  useEffect(() => {
    if (editMedicineSection) {
      fetch("/api/newMedicine?ids=1")
        .then((res) => res.json())
        .then((data) => {
          setMedicines(data.response);
        });
    }
  }, [editMedicineSection]);

  useEffect(() => {
    if (selectedMedicine) {
      setLoading(true);
      fetch(`/api/newMedicine?id=${selectedMedicine}`)
        .then((res) => res.json())
        .then((data) => {
          setValue("manufacturer", data.response.manufacturer);
          // setValue("vendor", data.response.vendor);
          setValue("name", data.response.name);
          setValue("medicineType", data.response.medicineType);
          setValue("salts", data.response.salts);
          setValue("packetSize.strips", data.response.packetSize.strips);
          setValue("packetSize.tabletsPerStrip", data.response.packetSize.tabletsPerStrip);
          setValue("isTablets", data.response.isTablets);
          setIsTablets(data.response.isTablets);
        });
      setLoading(false);
    }
  }, [selectedMedicine]);

  function onSubmit(data) {
    console.log(data);
    setData(data);
    setMedicineDetailsSection(true);
  }
  async function handleSave() {
    setSubmitting(true);
    try {
      let result = await fetch("/api/newMedicine", {
        method: selectedMedicine?"PUT":"POST",
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
    const manufacturer = manufacturers.find((m) => m._id === id);
    return manufacturer ? manufacturer.name : "Unknown Manufacturer";
  };
  // const getVendorNameById = (id) => {
  //   const vendor = vendors.find((m) => m._id === id);
  //   return vendor ? vendor.name : "Unknown Vendor";
  // };
  const getSaltNameById = (id) => {
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
                  <div className="w-2/5 flex justify-between">
                    <div className="">Medicine Type</div>
                    <div className="">:</div>
                  </div>
                  <span className="text-blue-500">{data.medicineType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2/5 flex justify-between items-center">
                    <div className="">Medical Representator</div>
                    <div className="">:</div>
                  </div>
                  <span className="text-blue-500">
                    {data.manufacturer.medicalRepresentator?.name +
                      " - " +
                      data.manufacturer.medicalRepresentator?.contact}
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
        <div
          className="bg-slate-900 w-1/2 mx-auto cursor-pointer hover:bg-gray-800 text-white font-semibold rounded-lg px-3 py-1"
          onClick={() => {
            setEditMedicineSection(!editMedicineSection);
            setSelectedMedicine(null);
            reset();
          }}
        >
          Click to Edit Medicine
        </div>
        {editMedicineSection && (
          <div className="my-2 p-2 bg-slate-300 rounded-lg">
            <label
              className="block font-semibold text-gray-900"
              htmlFor="manufacturer"
            >
              Select Medicine
            </label>
            <select
              id="manufacturer"
              {...register("id")}
              onChange={(e) => {
                setSelectedMedicine(e.target.value);
              }}
              className="mt-1 block px-4 py-3 text-white w-full md:w-3/4 mx-auto bg-gray-900 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
            >
              <option value="">-- Select a Medicine to edit --</option>
              {medicines &&
                medicines.map((medicine, index) => (
                  <option key={index} value={medicine._id}>
                    {medicine.name}
                  </option>
                ))}
            </select>
          </div>
        )}
        {loading && <div className="text-center">Loading...</div>}
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

        <div className="w-full md:w-3/4 flex items-center gap-2 mx-auto text-gray-900">
          <input
            type="checkbox"
            {...register("isTablets")}
            checked={isTablets}
            onChange={(e) => {
              setIsTablets(e.target.checked);
            }}
            className="size-4"
          />
          <div className="font-semibold">
            IsTablet<span className="text-red-500">{"* (Check this Box if Medicine is of Tablet or Capsules type.)"}</span>
          </div>
        </div>
        <div className="block font-semibold text-gray-900">Medicine Type</div>
        <div className="flex justify-center items-center text-gray-800 py-1">
          <input
            type="text"
            name="medicineType"
            placeholder="Medicine Type"
            {...register("medicineType")}
            className="p-2 rounded-xl w-full md:w-3/4 bg-gray-300 text-gray-900"
          />
        </div>
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
              {mr.name}
            </option>
          ))}
        </select>
        <div className="block font-semibold text-gray-900">Select Box Size</div>
        <div
          className="flex justify-center items-center text-gray-800 py-1"
          key={isTablets}
        >
          <input
            type="number"
            {...register("packetSize.strips", {
              required: "Strip Size is required",
            })}
            placeholder={isTablets ? "Strips/Box" : "Quantity"}
            className="p-2 rounded-xl w-36 bg-gray-300"
            min={1}
          />
          {isTablets && (
            <>
              <div className="p-2 text-xl font-semibold">
                <RxCross2 />
              </div>
              <input
                type="number"
                {...register("packetSize.tabletsPerStrip", {
                  required: "Tablets Size is required",
                  valueAsNumber: true,
                  min: 1,
                })}
                placeholder="Tablets/Strip"
                className="p-2 rounded-xl w-36 bg-gray-300"
              />
            </>
          )}
        </div>

        <div className="w-full md:w-3/4 mx-auto flex justify-center itmes-center my-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-800 py-2 px-4 rounded-xl font-semibold"
          >
            {selectedMedicine?"Update":"Add"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewMedicineForm;
