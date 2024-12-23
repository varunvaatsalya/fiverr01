"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function MedicineMetaDataForm() {
  const [selectedSection, setSelectedSection] = useState("Manufacturer");
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

  const handleFormSubmit = async (data, formType, reset) => {
    try {
      const response = await fetch(`/api/medicineMetaData?${formType}=1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log(data);
      const result = await response.json();
      console.log("Response:", result);
      if (result.success) {
        if (formType === "manufacturer") {
          setManufacturers([result.response, ...manufacturers]);
        } else if (formType === "vendor") {
          setVendors([result.response, ...vendors]);
        } else if (formType === "mr") {
          setMedicineRepresentators([
            result.response,
            ...medicineRepresentators,
          ]);
        } else if (formType === "salts") {
          setSalts([result.response, ...salts]);
        }
      }
      reset();
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <div className="py-2 md:max-w-2xl mx-auto">
      <div className="p-2 flex flex-wrap justify-center items-center gap-3">
        <button
          onClick={() => {
            setSelectedSection("Manufacturer");
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
            setSelectedSection("Medicine Representators");
          }}
          className={
            "px-3 py-2 text-lg font-semibold rounded-full border border-slate-900 " +
            (selectedSection === "Medicine Representators"
              ? "bg-slate-900 text-white"
              : "text-slate-900")
          }
        >
          Medicine Representators
        </button>
        <button
          onClick={() => {
            setSelectedSection("Salts");
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
      {
        selectedSection === "Manufacturer" ? (
          <Manufacturer
            manufacturers={manufacturers}
            handleFormSubmit={handleFormSubmit}
          />
        ) : selectedSection === "Vendor" ? (
          <Vendor vendors={vendors} handleFormSubmit={handleFormSubmit} />
        ) : selectedSection === "Medicine Representators" ? (
          <Mr
            medicineRepresentators={medicineRepresentators}
            handleFormSubmit={handleFormSubmit}
          />
        ) : selectedSection === "Salts" ? (
          <Salts salts={salts} handleFormSubmit={handleFormSubmit} />
        ) : null
      }
    </div>
  );
}

export default MedicineMetaDataForm;

function Manufacturer({ manufacturers, handleFormSubmit }) {
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = (data) => {
    handleFormSubmit(data, "manufacturer", reset);
  };
  return (
    <div className="my-2 w-full border border-gray-800 rounded-xl">
      <div className="text-xl py-1 font-semibold text-center bg-gray-800 rounded-t-lg">
        Manufacturer
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-2 flex justify-center items-center"
      >
        <input
          type="text"
          {...register("name")}
          placeholder="Enter Manufacturer Name"
          className="outline-none w-4/5 text-black p-1 bg-gray-300 rounded-l-lg "
        />
        <button type="submit" className="py-1 px-3 rounded-r-lg bg-blue-600">
          Add
        </button>
      </form>
      <div className="overflow-y-auto max-h-[80vh] md:max-h-[70vh] lg:max-h-[60vh]">
        {manufacturers.map((Manufacturer, index) => (
          <>
            <hr className="border-t border-gray-600 w-3/4 mx-auto" />
            <div key={index} className="text-center text-black">
              {Manufacturer.name}
            </div>
          </>
        ))}
      </div>
    </div>
  );
}

function Vendor({ vendors, handleFormSubmit }) {
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = (data) => {
    handleFormSubmit(data, "vendor", reset);
  };
  return (
    <div className="my-3 w-full border border-gray-800 rounded-xl">
      <div className="text-xl py-1 font-semibold text-center bg-gray-800 rounded-t-lg">
        Vendor
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-2 flex justify-center items-center"
      >
        <input
          type="text"
          {...register("name")}
          placeholder="Enter Vendor Name"
          className="outline-none w-4/5 text-black p-1 bg-gray-300 rounded-l-lg "
        />
        <button
          type="submit"
          className="py-1 px-3 rounded-r-lg bg-blue-600 hover:bg-blue-800"
        >
          Add
        </button>
      </form>
      <div className="overflow-y-auto max-h-[50vh]">
        {vendors.map((vendor, index) => (
          <>
            <hr className="border-t border-gray-600 w-3/4 mx-auto" />
            <div key={index} className="text-center text-black">
              {vendor.name}
            </div>
          </>
        ))}
      </div>
    </div>
  );
}

function Mr({ medicineRepresentators, handleFormSubmit }) {
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = (data) => {
    handleFormSubmit(data, "mr", reset);
  };
  return (
    <div className="my-3 w-full border border-gray-800 rounded-xl">
      <div className="text-xl py-1 font-semibold text-center bg-gray-800 rounded-t-lg">
        Medicine Representator
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        data-type="mr"
        className="p-2 flex justify-center items-center"
      >
        <input
          type="text"
          {...register("name")}
          placeholder="Enter Name"
          className="outline-none w-2/5 mx-2 text-black p-1 bg-gray-300 rounded-lg"
        />
        <input
          type="number"
          {...register("contact")}
          placeholder="Enter Contact"
          className="outline-none w-1/3 text-black p-1 bg-gray-300 rounded-l-lg"
        />
        <button
          type="submit"
          className="py-1 px-3 rounded-r-lg bg-blue-600 hover:bg-blue-800"
        >
          Add
        </button>
      </form>
      <div className="overflow-y-auto max-h-[50vh]">
        {medicineRepresentators.map((mr, index) => (
          <>
            <hr className="border-t border-gray-600 w-3/4 mx-auto" />
            <div key={index} className="flex items-center justify-center">
              <div className="text-center text-black w-[36%]">{mr.name}</div>
              <div className="text-center text-black w-[36%]">{mr.contact}</div>
            </div>
          </>
        ))}
      </div>
    </div>
  );
}

function Salts({ salts, handleFormSubmit }) {
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = (data) => {
    handleFormSubmit(data, "salts", reset);
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="my-3 w-full border border-gray-800 rounded-xl"
    >
      <div className="text-xl py-1 font-semibold text-center bg-gray-800 rounded-t-lg">
        Salts
      </div>
      <div className="p-2 flex justify-center items-center">
        <input
          type="text"
          {...register("name")}
          placeholder="Enter Name"
          className="outline-none w-2/5 mx-2 text-black p-1 bg-gray-300 rounded-lg"
        />
        <input
          type="text"
          {...register("useCase")}
          className="outline-none w-2/5 text-black p-1 bg-gray-300 rounded-lg"
        />
      </div>
      <div className="pb-2 flex justify-center items-center">
        <input
          type="text"
          {...register("comment")}
          className="outline-none w-4/5 text-black p-1 bg-gray-300 rounded-l-lg"
          placeholder="Comments (Optional)"
        />
        <button
          type="submit"
          className="py-1 px-3 rounded-r-lg bg-blue-600 hover:bg-blue-800"
        >
          Add
        </button>
      </div>
      <div className="overflow-y-auto max-h-[50vh]">
        {salts.map((salt, index) => (
          <>
            <hr className="border-t border-gray-600 w-3/4 mx-auto" />
            <div key={index} className="flex items-center justify-center">
              <div className="text-center text-black w-[36%]">{salt.name}</div>
              <div className="text-center text-black w-[36%]">
                {salt.useCase}
              </div>
            </div>
            {salt?.comment && (
              <div className="w-[70%] mx-auto text-center text-black">
                <span className="text-blue-500">Comments: </span>
                {salt.comment}
              </div>
            )}
          </>
        ))}
      </div>
    </form>
  );
}
