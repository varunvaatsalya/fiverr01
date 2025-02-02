"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaCross } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";

function MedicineMetaDataForm() {
  const [selectedSection, setSelectedSection] = useState("Manufacturer");
  const [manufacturers, setManufacturers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [medicineRepresentators, setMedicineRepresentators] = useState([]);
  const [salts, setSalts] = useState([]);
  const [updateMode, setUpdateMode] = useState(false);

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
        method: updateMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log(data);
      const result = await response.json();
      console.log("Response:", result);
      if (result.success) {
        if (updateMode) {
          if (formType === "manufacturer") {
            const updatedManufacturers = manufacturers.map((item) =>
              item._id === result.response._id ? result.response : item
            );
            setManufacturers(updatedManufacturers);
          } else if (formType === "vendor") {
            const updatedVendors = vendors.map((item) =>
              item._id === result.response._id ? result.response : item
            );
            setVendors(updatedVendors);
          } else if (formType === "mr") {
            const updatedMedicineRepresentators = medicineRepresentators.map(
              (item) =>
                item._id === result.response._id ? result.response : item
            );
            setMedicineRepresentators(updatedMedicineRepresentators);
          } else if (formType === "salts") {
            const updatedSalts = salts.map((item) =>
              item._id === result.response._id ? result.response : item
            );
            setSalts(updatedSalts);
          }
        } else {
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
      }
      reset();
      setUpdateMode(false);
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
        <Manufacturer
          manufacturers={manufacturers}
          updateMode={updateMode}
          setUpdateMode={setUpdateMode}
          handleFormSubmit={handleFormSubmit}
        />
      ) : selectedSection === "Vendor" ? (
        <Vendor
          vendors={vendors}
          updateMode={updateMode}
          setUpdateMode={setUpdateMode}
          handleFormSubmit={handleFormSubmit}
        />
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

function Manufacturer({
  manufacturers,
  updateMode,
  setUpdateMode,
  handleFormSubmit,
}) {
  const { register, handleSubmit, reset, setValue } = useForm();
  const onSubmit = (data) => {
    handleFormSubmit(data, "manufacturer", reset);
  };
  return (
    <div className="my-2 w-full border border-gray-800 rounded-xl">
      <div className="text-xl py-1 font-semibold text-center bg-gray-800 rounded-t-lg text-white">
        Manufacturer
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-2 flex flex-col justify-center items-center gap-2"
      >
        <input
          type="text"
          {...register("name", {
            required: true,
          })}
          placeholder="Enter Manufacturer Name"
          className="outline-none w-4/5 text-black p-1 bg-gray-300 rounded-lg mx-auto"
        />
        <div className="flex justify-center items-center">
          <input
            type="text"
            {...register("medicalRepresentator.name")}
            placeholder="MR Name"
            className="outline-none w-[45%] mx-2 text-black p-1 bg-gray-300 rounded-lg"
          />
          <input
            type="number"
            {...register("medicalRepresentator.contact")}
            placeholder="MR Contact"
            className="outline-none w-[40%] text-black p-1 bg-gray-300 rounded-l-lg"
          />
          <button
            type="submit"
            className="py-1 px-3 rounded-r-lg bg-blue-600 text-white"
          >
            {updateMode ? "Update" : "Add"}
          </button>
        </div>
      </form>
      <div className="overflow-y-auto max-h-[80vh] md:max-h-[70vh] lg:max-h-[60vh]">
        {manufacturers.map((Manufacturer) => (
          <div key={Manufacturer._id}>
            <hr className="border-t border-gray-600 w-3/4 mx-auto" />
            <div
              
              className="text-center text-black flex justify-center gap-2 items-center"
            >
              <div className="">
                {Manufacturer.name +
                  ", " +
                  Manufacturer?.medicalRepresentator?.name +
                  ", " +
                  Manufacturer?.medicalRepresentator?.contact}
              </div>
              <button
                className="text-gray-600 hover:bg-gray-400 bg-gray-300 rounded text-xs font-semibold px-2"
                onClick={() => {
                  setValue("id", Manufacturer._id);
                  setValue("name", Manufacturer.name);
                  setValue(
                    "medicalRepresentator.name",
                    Manufacturer.medicalRepresentator?.name
                  );
                  setValue(
                    "medicalRepresentator.contact",
                    Manufacturer.medicalRepresentator?.contact
                  );
                  setUpdateMode(true);
                }}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Vendor({ vendors, updateMode, setUpdateMode, handleFormSubmit }) {
  const { register, handleSubmit, reset, setValue } = useForm();
  const onSubmit = (data) => {
    handleFormSubmit(data, "vendor", reset);
  };
  return (
    <div className="my-3 w-full border border-gray-800 rounded-xl">
      <div className="text-xl py-1 font-semibold text-center bg-gray-800 rounded-t-lg text-white">
        Vendor
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-2 flex flex-col gap-1 justify-center items-center"
      >
        <input
          type="text"
          {...register("name", { required: true })}
          placeholder="Enter Vendor Name"
          className="outline-none w-4/5 text-black p-1 bg-gray-300 rounded-lg "
        />
        <div className="flex justify-center">
          <input
            type="number"
            {...register("contact")}
            placeholder="Contact"
            className="outline-none w-[45%] mx-2 text-black p-1 bg-gray-300 rounded-lg"
          />
          <input
            type="text"
            {...register("address")}
            placeholder="Address"
            className="outline-none w-[40%] text-black p-1 bg-gray-300 rounded-l-lg"
          />
          <button
            type="submit"
            className="py-1 px-3 rounded-r-lg bg-blue-600 text-white"
          >
            {updateMode ? "Update" : "Add"}
          </button>
        </div>
        <div className="text-center font-semibold text-gray-800">
          Bank Details
        </div>
        <div className="flex flex-col justify-center items-center gap-1">
          <div className="flex justify-center items-center gap-1">
            <input
              type="text"
              {...register("bankDetails.bankName")}
              placeholder="Bank Name"
              className="outline-none w-[45%] mx-2 text-black p-1 bg-gray-300 rounded-lg"
            />
            <input
              type="number"
              {...register("bankDetails.accountNo")}
              placeholder="Account No."
              className="outline-none w-[40%] text-black p-1 bg-gray-300 rounded-lg"
            />
          </div>
          <div className="flex justify-center items-center gap-1">
            <input
              type="text"
              {...register("bankDetails.ifsc")}
              placeholder="IFSC"
              className="outline-none w-[45%] mx-2 text-black p-1 bg-gray-300 rounded-lg"
            />
            <input
              type="text"
              {...register("bankDetails.branch")}
              placeholder="Branch"
              className="outline-none w-[40%] text-black p-1 bg-gray-300 rounded-lg"
            />
          </div>
        </div>
      </form>
      <div className="overflow-y-auto max-h-[60vh]">
        {vendors.map((vendor) => (
          <>
            <hr className="border-t border-gray-600 w-3/4 mx-auto" />
            <div className="flex justify-center items-center gap-2">
              <div key={vendor._id} className="text-center text-black">
                {vendor.name + ", " + vendor?.contact + ", " + vendor?.address}
              </div>
              <button
                className="text-gray-600 hover:bg-gray-400 bg-gray-300 rounded text-xs font-semibold px-2"
                onClick={() => {
                  setValue("id", vendor._id);
                  setValue("name", vendor.name);
                  setValue("contact", vendor.contact);
                  setValue("address", vendor.address);
                  setValue("bankDetails.bankName", vendor.bankDetails?.bankName);
                  setValue(
                    "bankDetails.accountNo",
                    vendor.bankDetails?.accountNo
                  );
                  setValue("bankDetails.ifsc", vendor.bankDetails?.ifsc);
                  setValue("bankDetails.branch", vendor.bankDetails?.branch);
                  setUpdateMode(true);
                }}
              >
                Edit
              </button>
            </div>
            <div className="text-center text-black">
              {vendor?.bankDetails?.bankName +
                ", " +
                vendor?.bankDetails?.accountNo}
            </div>
            <div className="text-center text-black">
              {vendor?.bankDetails?.ifsc + ", " + vendor?.bankDetails?.branch}
            </div>
          </>
        ))}
      </div>
    </div>
  );
}

// function Mr({ medicineRepresentators, handleFormSubmit }) {
//   const { register, handleSubmit, reset } = useForm();
//   const onSubmit = (data) => {
//     handleFormSubmit(data, "mr", reset);
//   };
//   return (
//     <div className="my-3 w-full border border-gray-800 rounded-xl">
//       <div className="text-xl py-1 font-semibold text-center bg-gray-800 rounded-t-lg text-white">
//         Medicine Representator
//       </div>
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         data-type="mr"
//         className="p-2 flex justify-center items-center"
//       >
//         <input
//           type="text"
//           {...register("name")}
//           placeholder="Enter Name"
//           className="outline-none w-2/5 mx-2 text-black p-1 bg-gray-300 rounded-lg"
//         />
//         <input
//           type="number"
//           {...register("contact")}
//           placeholder="Enter Contact"
//           className="outline-none w-1/3 text-black p-1 bg-gray-300 rounded-l-lg"
//         />
//         <button
//           type="submit"
//           className="py-1 px-3 rounded-r-lg bg-blue-600 hover:bg-blue-800 text-white"
//         >
//           Add
//         </button>
//       </form>
//       <div className="overflow-y-auto max-h-[50vh]">
//         {medicineRepresentators.map((mr, index) => (
//           <>
//             <hr className="border-t border-gray-600 w-3/4 mx-auto" />
//             <div key={index} className="flex items-center justify-center">
//               <div className="text-center text-black w-[36%]">{mr.name}</div>
//               <div className="text-center text-black w-[36%]">{mr.contact}</div>
//             </div>
//           </>
//         ))}
//       </div>
//     </div>
//   );
// }

function Salts({ salts, updateMode, setUpdateMode, handleFormSubmit }) {
  const { register, handleSubmit, reset, setValue } = useForm();
  const onSubmit = (data) => {
    handleFormSubmit(data, "salts", reset);
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
              <div className="text-center text-black">
                {salt.useCase}
              </div>
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
