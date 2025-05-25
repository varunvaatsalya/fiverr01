"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";
import MedicineMfgVendorList from "./MedicineMfgVendorList";

function MedicineMetaDataForm() {
  const searchParams = useSearchParams();

  const [selectedSection, setSelectedSection] = useState("Manufacturer");
  const [manufacturers, setManufacturers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [salts, setSalts] = useState([]);
  const [updateMode, setUpdateMode] = useState(false);
  const [isEditPermission, setIsEditPermission] = useState(false);

  useEffect(() => {
    const sectionFromURL = searchParams.get("type");
    if (["Manufacturer", "Vendor"].includes(sectionFromURL)) {
      setSelectedSection(sectionFromURL);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/medicineMetaData")
      .then((res) => res.json())
      .then((data) => {
        setManufacturers(data.response.manufacturers);
        setVendors(data.response.vendors);
        setSalts(data.response.salts);
        setIsEditPermission(data.editPermission);
      });
  }, []);

  const handleFormSubmit = async (data, reset) => {
    try {
      const response = await fetch(`/api/medicineMetaData?${formType}=1`, {
        method: updateMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        if (updateMode) {
          const updatedSalts = salts.map((item) =>
            item._id === result.response._id ? result.response : item
          );
          setSalts(updatedSalts);
        } else {
          setSalts([result.response, ...salts]);
        }
      }
      reset();
      setUpdateMode(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!isEditPermission) {
    return (
      <div className="w-[95%] md:w-4/5 lg:w-3/4 text-center bg-slate-800 text-white py-2 text-lg rounded-xl mx-auto my-2">
        You do not have permission to add or edit medicines.
      </div>
    );
  }

  return (
    <div className="py-2 md:max-w-2xl mx-auto">
      <div className="p-2 flex flex-wrap justify-center items-center gap-3">
        <button
          onClick={() => {
            setSelectedSection("Manufacturer");
            setUpdateMode(false);
          }}
          className={
            "px-3 py-2 text-lg font-semibold rounded-full border border-slate-900 " +
            (selectedSection === "Manufacturer"
              ? "bg-slate-900 text-white"
              : "text-slate-900")
          }
        >
          Manufacturer
        </button>
        <button
          onClick={() => {
            setSelectedSection("Vendor");
            setUpdateMode(false);
          }}
          className={
            "px-3 py-2 text-lg font-semibold rounded-full border border-slate-900 " +
            (selectedSection === "Vendor"
              ? "bg-slate-900 text-white"
              : "text-slate-900")
          }
        >
          Vendor
        </button>
        <button
          onClick={() => {
            setSelectedSection("Salts");
            setUpdateMode(false);
          }}
          className={
            "px-3 py-2 text-lg font-semibold rounded-full border border-slate-900 " +
            (selectedSection === "Salts"
              ? "bg-slate-900 text-white"
              : "text-slate-900")
          }
        >
          Salts
        </button>
      </div>
      {selectedSection === "Manufacturer" ? (
        <MedicineMfgVendorList type="manufacturer" info={manufacturers} />
      ) : selectedSection === "Vendor" ? (
        <>
          <MedicineMfgVendorList type="vendor" info={vendors} />
        </>
      ) : selectedSection === "Salts" ? (
        <Salts
          salts={salts}
          updateMode={updateMode}
          setUpdateMode={setUpdateMode}
          handleFormSubmit={handleFormSubmit}
        />
      ) : null}
    </div>
  );
}

export default MedicineMetaDataForm;

function Salts({ salts, updateMode, setUpdateMode, handleFormSubmit }) {
  const { register, handleSubmit, reset, setValue } = useForm();
  const onSubmit = (data) => {
    handleFormSubmit(data, reset);
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="my-3 w-full border border-gray-800 rounded-xl"
    >
      <div className="text-xl py-1 font-semibold text-center bg-gray-800 rounded-t-lg text-white">
        Salts
      </div>
      {updateMode && (
        <div className="max-w-fit rounded px-3 py-1 text-xs font-semibold flex justify-center items-center gap-1 bg-red-400 text-white mx-auto mt-2">
          <div className="">Update Mode</div>
          <RxCross2
            className="size-5 hover:bg-red-600 rounded-full cursor-pointer"
            onClick={() => {
              reset();
              setUpdateMode(false);
            }}
          />
        </div>
      )}
      <div className="p-2 flex justify-center items-center">
        <input
          type="text"
          {...register("name")}
          placeholder="Enter Name"
          className="outline-none w-2/5 mx-2 text-black p-1 bg-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="UseCase"
          {...register("useCase")}
          className="outline-none w-2/5 text-black p-1 bg-gray-300 rounded-lg"
        />
      </div>
      <div className="pb-2 flex justify-center items-center">
        <button
          type="submit"
          className="py-1 px-3 rounded-lg bg-blue-600 hover:bg-blue-800 text-white"
        >
          {updateMode ? "Update" : "Add"}
        </button>
      </div>
      <div className="overflow-y-auto max-h-[50vh]">
        {salts.map((salt, index) => (
          <div key={salt._id}>
            <hr className="border-t border-gray-600 w-3/4 mx-auto" />
            <div key={index} className="flex items-center justify-center gap-4">
              <div className="text-center text-black">{salt.name}</div>
              <div className="text-center text-black">{salt.useCase}</div>
              <div
                className="text-gray-600 hover:bg-gray-400 bg-gray-300 cursor-pointer rounded text-xs font-semibold px-2"
                onClick={() => {
                  setValue("id", salt._id);
                  setValue("name", salt.name);
                  setValue("useCase", salt.useCase);
                  setUpdateMode(true);
                }}
              >
                Edit
              </div>
            </div>
          </div>
        ))}
      </div>
    </form>
  );
}
