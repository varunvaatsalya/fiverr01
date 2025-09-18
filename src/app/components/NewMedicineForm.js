"use client";
import { BadgeX } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
// import Loading from "./Loading";

function NewMedicineForm() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [manufacturers, setManufacturers] = useState([]);
  // const [vendors, setVendors] = useState([]);
  const [salts, setSalts] = useState([]);
  const [editMedicineSection, setEditMedicineSection] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditPermission, setIsEditPermission] = useState(false);

  useEffect(() => {
    fetch("/api/medicineMetaData?manufacturer=1&salts=1")
      .then((res) => res.json())
      .then((data) => {
        setManufacturers(data.response.manufacturers);
        // setVendors(data.response.vendors);
        setSalts(data.response.salts);
        setIsEditPermission(data.editPermission);
      });
  }, []);

  const { register, handleSubmit, control, setValue, watch, reset } = useForm({
    defaultValues: {
      medicines: [
        {
          unitLabels: {
            level2: "box",
            level1: "pack",
            level0: "unit",
          },
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicines",
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
          // Add selected medicine to editedMedicines array
          setValue("medicines", [
            {
              id: selectedMedicine,
              name: data.response.name,
              manufacturer: data.response.manufacturer,
              medicineType: data.response.medicineType,
              salts: data.response.salts,
              packetSize: {
                strips: data.response.packetSize?.strips || 1,
                tabletsPerStrip: data.response.packetSize?.tabletsPerStrip || 1,
              },
              status: data.response.status || "active",
              unitLabels: {
                level2: data.response.unitLabels.level2 || "box",
                level1: data.response.unitLabels.level1 || "pack",
                level0: data.response.unitLabels.level0 || "unit",
              },
              isTablets: data.response.isTablets,
            },
          ]);
          setLoading(false);
        });
    }
  }, [selectedMedicine]);

  function onSubmit(data) {
    // console.log(data);
    handleSave(data);
    // setData(data);
    // setMedicineDetailsSection(true);
  }
  async function handleSave(data) {
    setSubmitting(true);
    try {
      let result = await fetch("/api/newMedicine", {
        method: selectedMedicine ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      result = await result.json();
      setResult(result.medicines);
      if (result.success) {
        reset();
        setSelectedMedicine(null);
        setEditMedicineSection(false);
        setTimeout(() => {
          setMessage("");
        }, 5000);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  }
  // const getManufacturerNameById = (id) => {
  //   const manufacturer = manufacturers.find((m) => m._id === id);
  //   return manufacturer ? manufacturer.name : "Unknown Manufacturer";
  // };
  // const getVendorNameById = (id) => {
  //   const vendor = vendors.find((m) => m._id === id);
  //   return vendor ? vendor.name : "Unknown Vendor";
  // };
  // const getSaltNameById = (id) => {
  //   const salt = salts.find((m) => m._id === id);
  //   return salt ? salt.name : "Unknown Salt";
  // };

  if (!isEditPermission) {
    return (
      <div className="w-[95%] md:w-4/5 lg:w-3/4 text-center bg-slate-800 text-white py-2 text-lg rounded-xl mx-auto my-2">
        You do not have permission to add or edit medicines.
      </div>
    );
  }
  return (
    <div className="w-full px-2">
      {/* {medicineDetailsSection && (
        <MedicineDetailsSection
          data={data}
          message={message}
          handleSave={handleSave}
          getManufacturerNameById={getManufacturerNameById}
          getSaltNameById={getSaltNameById}
          submitting={submitting}
          setMedicineDetailsSection={setMedicineDetailsSection}
        />
      )} */}
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="p-2">
        <div className="flex justify-between items-center gap-3">
          <div>
            {!editMedicineSection && (
              <div
                className="bg-blue-800 cursor-pointer hover:bg-blue-700 text-white rounded-lg px-3 py-1"
                onClick={() =>
                  append({
                    manufacturer: "",
                    name: "",
                    isTablets: false,
                    medicineType: "",
                    salts: "",
                    packetSize: { strips: "", tabletsPerStrip: 1 },
                  })
                }
              >
                Add New Medicine
              </div>
            )}
          </div>
          <div className="flex justify-center items-center gap-2">
            {editMedicineSection && (
              <select
                onChange={(e) => {
                  setSelectedMedicine(e.target.value);
                }}
                className="px-4 py-2 text-white bg-gray-900 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
              >
                <option value="">-- Select a Medicine to edit --</option>
                {medicines &&
                  medicines.map((medicine, index) => (
                    <option key={index} value={medicine._id}>
                      {medicine.name}
                    </option>
                  ))}
              </select>
            )}
            <div
              className="bg-slate-800 cursor-pointer hover:bg-gray-700 text-white rounded-lg px-3 py-1"
              onClick={() => {
                setEditMedicineSection(!editMedicineSection);
                setSelectedMedicine(null);
                reset();
              }}
            >
              Click to Edit Medicine
            </div>
          </div>
        </div>
        {result && result.length > 0 && (
          <ol>
            {result.map((med, index) => (
              <li
                key={index}
                className={med.success ? "text-gray-900" : "text-red-600"}
              >
                {index + 1 + ". " + med.message}
              </li>
            ))}
            <button
              onClick={() => setResult(null)}
              className="text-white bg-blue-600 rounded-lg px-4 py-2 hover:bg-blue-700"
            >
              Clear
            </button>
          </ol>
        )}
        {loading && <div className="text-center">Loading...</div>}
        {fields.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 my-2 bg-gray-800 text-white rounded-lg py-1 px-2">
            <div className="flex-1 min-w-28 text-center">Manufacturer</div>
            <div className="flex-1 min-w-28 text-center">Medicine Name</div>
            <div className="text-center">isTablets</div>
            <div className="flex-1 min-w-28 text-center">Medicine Type</div>
            <div className="flex-1 min-w-28 text-center">Salts</div>
          </div>
        )}
        {fields.map((field, index) => {
          let isTablets = watch("medicines")[index]?.isTablets;
          let isDisable = watch("medicines")[index]?.status === "disable";
          return (
            <div
              key={field.id}
              className="my-2 bg-gray-900 text-white rounded-lg p-2 space-y-2"
            >
              <div className="flex gap-2 items-center">
                <div className="px-1">{index + 1 + "."}</div>
                <select
                  id="manufacturer"
                  {...register(`medicines.${index}.manufacturer`, {
                    required: "Manufacturer is required",
                  })}
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-600"
                >
                  <option value="">-- Select a Manufacturer --</option>
                  {manufacturers.map((Manufacturer, index) => (
                    <option key={index} value={Manufacturer._id}>
                      {Manufacturer.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  {...register(`medicines.${index}.name`, {
                    required: "Medicine name is required",
                  })}
                  placeholder="Medicine Name"
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-600"
                />
                <input
                  type="checkbox"
                  checked={watch("medicines")[index]?.isTablets}
                  {...register(`medicines.${index}.isTablets`)}
                  className="size-6"
                />
                <input
                  type="text"
                  {...register(`medicines.${index}.medicineType`)}
                  placeholder="Medicine Type"
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-600"
                />
                <select
                  id="salts"
                  {...register(`medicines.${index}.salts`, {
                    required: "salts is required",
                  })}
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-600"
                >
                  <option value="">-- Select a salt --</option>
                  {salts.map((mr, index) => (
                    <option key={index} value={mr._id}>
                      {mr.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4">
                {selectedMedicine && (
                  <>
                    {isDisable && <BadgeX className="text-red-600" />}
                    <div className="font-semibold">Status:</div>
                    <select
                      {...register(`medicines.${index}.status`, {
                        onChange: (e) => {
                          const selectedValue = e.target.value;
                          if (selectedValue === "disable") {
                            const confirmed = window.confirm(
                              "Are you sure you want to disable this medicine?"
                            );
                            if (!confirmed) {
                              e.target.value = "active";
                            }
                          }
                        },
                      })}
                      className="w-28 px-1 h-8 rounded-lg bg-gray-600 text-white"
                    >
                      <option value="active">Active</option>
                      <option value="disable">Disable</option>
                    </select>
                  </>
                )}
                <div className="font-semibold">Packet Size:</div>
                <div className="flex gap-2 items-center border border-gray-600 p-1 rounded-md">
                  <span>1</span>
                  <input
                    type="text"
                    {...register(`medicines.${index}.unitLabels.level2`, {
                      required: "level 2 name is required",
                      onChange: (e) => {
                        e.target.value = e.target.value.toLowerCase();
                      },
                    })}
                    className="w-28 px-1 h-8 rounded-lg bg-gray-600"
                  />
                  <span>=</span>
                  <input
                    type="number"
                    {...register(`medicines.${index}.packetSize.strips`, {
                      required: "packetSize strips is required",
                      min: {
                        value: 1,
                        message: "Minimum value should be 1",
                      },
                    })}
                    min={1}
                    placeholder="Enter value"
                    className="w-28 px-1 h-8 rounded-lg bg-gray-600"
                  />
                  <input
                    type="text"
                    {...register(`medicines.${index}.unitLabels.level1`, {
                      required: "level 1 name is required",
                      onChange: (e) => {
                        e.target.value = e.target.value.toLowerCase();
                      },
                    })}
                    className="w-28 px-1 h-8 rounded-lg bg-gray-600"
                  />
                </div>
                {isTablets && (
                  <div className="flex gap-2 items-center border border-gray-600 p-1 rounded-md">
                    <span>1</span>
                    <div>{watch(`medicines.${index}.unitLabels.level1`)}</div>
                    <span>=</span>
                    <input
                      type="number"
                      {...register(
                        `medicines.${index}.packetSize.tabletsPerStrip`,
                        {
                          required: "Tablets Size is required",
                          valueAsNumber: true,
                          min: 1,
                        }
                      )}
                      placeholder="Enter Value"
                      className="w-28 px-1 h-8 rounded-lg bg-gray-600"
                    />
                    <input
                      type="text"
                      {...register(`medicines.${index}.unitLabels.level0`, {
                        required: "level 0 name is required",
                        onChange: (e) => {
                          e.target.value = e.target.value.toLowerCase();
                        },
                      })}
                      className="w-28 px-1 h-8 rounded-lg bg-gray-600"
                    />
                  </div>
                )}
                {!editMedicineSection && (
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div className="flex justify-end">
          {fields.length > 0 && (
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded-xl font-semibold my-2"
            >
              {submitting ? "Wait..." : selectedMedicine ? "Update" : "Save"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default NewMedicineForm;

// function MedicineDetailsSection({
//   data,
//   message,
//   handleSave,
//   getManufacturerNameById,
//   getSaltNameById,
//   submitting,
//   setMedicineDetailsSection,
// }) {
//   return (
//     <div className="absolute top-0 left-0">
//       <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
//         <div className="w-[95%] md:w-4/5 lg:w-3/4 py-4 text-center bg-slate-950 px-4 rounded-xl">
//           <h2 className="font-bold text-2xl text-blue-500">Medicine Details</h2>
//           <hr className="border border-slate-800 w-full my-2" />
//           {message && (
//             <div className="my-1 text-center text-red-500">{message}</div>
//           )}
//           <div className="font-semibold text-white space-y-1 w-full md:w-1/2 mx-auto text-sm md:text-base">
//             <div className="flex items-center gap-2">
//               <div className="w-2/5 flex justify-between">
//                 <div className="">Manufacturer</div>
//                 <div className="">:</div>
//               </div>
//               <span className="text-blue-500">
//                 {getManufacturerNameById(data.manufacturer)}
//               </span>
//             </div>
//             {/* <div className="flex items-center gap-2">
//             <div className="w-2/5 flex justify-between">
//               <div className="">Vendor</div>
//               <div className="">:</div>
//             </div>
//             <span className="text-blue-500">
//               {getVendorNameById(data.vendor)}
//             </span>
//           </div> */}
//             <div className="flex items-center gap-2">
//               <div className="w-2/5 flex justify-between">
//                 <div className="">Name</div>
//                 <div className="">:</div>
//               </div>
//               <span className="text-blue-500">{data.name}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-2/5 flex justify-between">
//                 <div className="">Medicine Type</div>
//                 <div className="">:</div>
//               </div>
//               <span className="text-blue-500">{data.medicineType}</span>
//             </div>
//             {/* <div className="flex items-center gap-2">
//             <div className="w-2/5 flex justify-between items-center">
//               <div className="">Medical Representator</div>
//               <div className="">:</div>
//             </div>
//             <span className="text-blue-500">
//               {data.manufacturer.medicalRepresentator?.name +
//                 " - " +
//                 data.manufacturer.medicalRepresentator?.contact}
//             </span>
//           </div> */}
//             <div className="flex items-center gap-2">
//               <div className="w-2/5 flex justify-between">
//                 <div className="">Salts</div>
//                 <div className="">:</div>
//               </div>
//               <span className="text-blue-500">
//                 {getSaltNameById(data.salts)}
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-2/5 flex justify-between">
//                 <div className="">Box Size</div>
//                 <div className="">:</div>
//               </div>
//               <span className="text-blue-500">
//                 {data.packetSize.tabletsPerStrip +
//                   " Nos/Strip, & " +
//                   data.packetSize.strips +
//                   " Strips"}
//               </span>
//             </div>
//           </div>

//           <hr className="border border-slate-800 w-full my-2" />
//           <div className="flex px-4 gap-3 justify-end">
//             <div
//               className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
//               onClick={() => {
//                 setMedicineDetailsSection(false);
//               }}
//             >
//               Cancel
//             </div>
//             <button
//               onClick={handleSave}
//               className="w-20 h-8 py-1 flex items-center justify-center gap-2 bg-green-500 rounded-lg font-semibold cursor-pointer text-white"
//               disabled={submitting}
//             >
//               {submitting ? <Loading size={15} /> : <></>}
//               {submitting ? "Wait..." : "Confirm"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
