// daily sale details
// auto efresh
// new page medcine
// desk entery name
// rack details
// manufactreur wise sorting in godoon stock
// many vendors for a medicine and handle their all request - vendor unlink
// order krne wale medicines lists reatils godwn
// filter with salt and manfacturer
// down kitna kitna purchase kis vendor se purchase history
// medicine doses
// expiry alert
// user role
// purchase stock ka payment track

// --- DONE ---

// mfg
// mr mail field and godown mail option snd whatsapp option
// new medicine form sevendor ko hata routes se bhi
// vendor payment
// vendor adrees contact bank
// whatsapp vendor change to all medicine select
// minimum recommended stocjk count godown reatiler ---imp
// rename bulk strock upload

"use client";
import React, { useEffect, useState } from "react";
import { IoIosArrowDropdown, IoIosArrowDropright } from "react-icons/io";
import { IoAddCircle, IoSearchOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import Loading from "./Loading";
import { FaCircleDot } from "react-icons/fa6";
import { formatDateToIST } from "../utils/date";

function NewPharmacyExpressInvoice({
  setNewInvoiceSection,
  setExpressBills,
  editExpressInvoice,
  setEditExpressInvoice,
}) {
  const [message, setMessage] = useState("");
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [requestedMedicineDetails, setRequestedMedicineDetails] =
    useState(null);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [finding, setFinding] = useState(false);
  const [query, setQuery] = useState("");
  const [dropDown, setDropDown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchedPatientsList, setSearchedPatientsList] = useState([]);
  const [searchedMedicines, setSearchedMedicines] = useState([]);
  const [selectedPatientList, setSelectedPatientList] = useState({
    type: "Latest",
    data: patients,
  });

  //   useEffect(() => {
  //     if (expressData) {
  //       setSelectedPatient(expressData.patientId);
  //       const outputArray = expressData.medicines.map((item) => ({
  //         _id: item.medicineId._id,
  //         name: item.medicineId.name,
  //         isTablets: item.medicineId.isTablets,
  //         packetSize: item.medicineId.packetSize,
  //         quantity: item.quantity,
  //       }));
  //       setSelectedMedicines(outputArray);
  //     }
  //   }, [expressData]);

  useEffect(() => {
    setSelectedPatientList({
      type: "Latest",
      data: patients,
    });
  }, [patients]);

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch(`/api/newPharmacyInvoice?info=1`);
        result = await result.json();
        if (result.success) {
          setPatients(result.patientsList);
          setMedicines(result.medicinesList);
          setSearchedMedicines(result.medicinesList);
          if (editExpressInvoice && result.medicinesList.length > 0) {
            setSelectedPatient(editExpressInvoice.patientId);
            const outputArray = editExpressInvoice.medicines.map((item) => {
              const medicineDetails = result.medicinesList.find(
                (med) => med._id === item.medicineId._id
              );

              console.log(item.medicineId._id, medicines, medicineDetails);
              return {
                ...medicineDetails,
                quantity: item.quantity,
              };
            });
            setSelectedMedicines(outputArray);
          }
        } else {
          setMessage(result.message);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);

  const handleSearchMedicine = (query) => {
    let filteredMedicines = [];
    if (medicines) {
      filteredMedicines = medicines.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(query.toLowerCase()) ||
          medicine.salts.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    setSearchedMedicines(filteredMedicines);
  };

  const handleSearchPatient = async () => {
    if (query) {
      try {
        setMessage(null);
        setFinding(true);
        let result = await fetch(`/api/searchPatient`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
          }),
        });
        result = await result.json();

        if (result.success) {
          setSearchedPatientsList(result.patients);
          setSelectedPatientList({ type: "Searched", data: result.patients });
        }
        setMessage(result.message);
      } catch (error) {
        console.error("Error submitting application:", error);
      } finally {
        setFinding(false);
      }
    }
  };

  const handleCheckboxChange = (medicine) => {
    setRequestedMedicineDetails(null);
    if (selectedMedicines.some((m) => m._id === medicine._id)) {
      setSelectedMedicines(
        selectedMedicines.filter((m) => m._id !== medicine._id)
      );
    } else {
      setSelectedMedicines([
        ...selectedMedicines,
        {
          ...medicine,
          quantity: { strips: "", tablets: "", normalQuantity: "" },
        },
      ]);
    }
  };

  const handleInputChange = (medicineId, field, value) => {
    setRequestedMedicineDetails(null);
    setSelectedMedicines((prevSelectedMedicines) =>
      prevSelectedMedicines.map((m) =>
        m._id === medicineId
          ? { ...m, quantity: { ...m.quantity, [field]: value } }
          : m
      )
    );
  };

  const removeMedicine = (id) => {
    setRequestedMedicineDetails(null);
    setSelectedMedicines(selectedMedicines.filter((m) => m._id !== id));
  };

  function getGrandTotal() {
    const grandTotal = requestedMedicineDetails.reduce(
      (grandTotal, medicine) => {
        if (
          medicine.allocatedQuantities &&
          medicine.allocatedQuantities.length > 0
        ) {
          const totalPrice = medicine.allocatedQuantities.reduce(
            (total, batch) => total + batch.price,
            0
          );
          return grandTotal + totalPrice;
        }
        return grandTotal;
      },
      0
    );
    return parseFloat(grandTotal.toFixed(2));
  }

  const onSubmit = async () => {
    try {
      let requestedMedicine = selectedMedicines.map((medicine) => {
        const newQuantity = {
          strips: Number(medicine.quantity.strips) || 0,
          tablets: Number(medicine.quantity.tablets) || 0,
          normalQuantity: Number(medicine.quantity.normalQuantity) || 0,
        };
        if (
          (medicine.isTablets &&
            newQuantity.strips <= 0 &&
            newQuantity.tablets <= 0) ||
          (!medicine.isTablets && newQuantity.normalQuantity <= 0)
        ) {
          throw new Error(`Set the correct quantity in : ${medicine.name}`);
        }
        return {
          medicineId: medicine._id,
          isTablets: medicine.isTablets,
          quantity: newQuantity,
        };
      });

      setSubmitting(true);
      try {
        let url = requestedMedicineDetails
          ? "/api/newExpressBill"
          : "/api/newPharmacyInvoice?info=1";
        let data = requestedMedicineDetails
          ? {
              patientId: selectedPatient._id,
              medicines: requestedMedicine,
              ...(editExpressInvoice && { invoiceId: editExpressInvoice._id }),
            }
          : { requestedMedicine };
        let result = await fetch(url, {
          method:
            requestedMedicineDetails && editExpressInvoice ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        result = await result.json();
        if (result.success) {
          if (requestedMedicineDetails) {
            setExpressBills((expressBills) => {
              if (editExpressInvoice) {
                return expressBills.map((bill) =>
                  bill._id === result.newExpressInvoice._id
                    ? result.newExpressInvoice
                    : bill
                );
              } else {
                return [...expressBills, result.newExpressInvoice];
              }
            });
            setEditExpressInvoice(null);
            setNewInvoiceSection(false);
          } else {
            setRequestedMedicineDetails(result.requestResults);
          }
        } else {
          setMessage(result.message);
        }
      } catch (error) {
        setMessage("Error in submitting application");
        console.error("Error submitting application:", error);
      }
      setSubmitting(false);
    } catch (error) {
      setMessage(error.message);
      setTimeout(() => {
        setMessage("");
      }, 4000);
    }
  };

  return (
    <>
      <div className="w-[95%] md:w-4/5 text-center border border-slate-900 rounded-xl mx-auto my-2 pb-2">
        <div className="text-center py-2 rounded-t-lg bg-slate-900 text-xl text-white font-semibold">
          {editExpressInvoice ? "Edit Invoice" : "New Invoice"}
        </div>
        <div className="p-2">
          {selectedPatient ? (
            <div className="flex flex-wrap justify-around text-white">
              <div className="font-semibold">
                Pateint:{" "}
                <span className="text-blue-500 uppercase">
                  {selectedPatient?.name}
                </span>
              </div>
              <div className="font-semibold">
                UHID:{" "}
                <span className="text-blue-500 uppercase">
                  {selectedPatient?.uhid}
                </span>
              </div>
              <button
                className="px-2 py-1 text-red-500 hover:text-red-700 text-sm rounded-lg font-semibold"
                onClick={() => {
                  setSelectedPatient(null);
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex justify-center gap-2 items-center my-1">
                <div
                  onClick={() => {
                    setDropDown(!dropDown);
                  }}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer text-gray-100 text-2xl"
                >
                  {dropDown ? <IoIosArrowDropdown /> : <IoIosArrowDropright />}
                </div>
                <input
                  type="text"
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                  placeholder="Select or Search the Patient"
                  className=" block px-4 py-3 w-full text-gray-100 bg-gray-700  rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                />
                <button
                  disabled={finding || !query}
                  onClick={handleSearchPatient}
                  className="p-2 rounded-lg hover:bg-gray-600 bg-gray-700 text-gray-100 text-2xl"
                >
                  {finding ? <Loading size={20} /> : <IoSearchOutline />}
                </button>
              </div>
              {dropDown && (
                <div className="absolute top-12 left-12 my-1 rounded-lg p-2 bg-gray-700 border-2 border-gray-500">
                  <div className="p-2 flex items-center gap-2">
                    <div
                      onClick={() => {
                        setSelectedPatientList({
                          type: "Latest",
                          data: patients,
                        });
                      }}
                      className={
                        "py-1 px-2 cursor-pointer rounded border border-gray-200 font-semibold " +
                        (selectedPatientList.type === "Latest"
                          ? "bg-gray-200 text-gray-800"
                          : "text-gray-50")
                      }
                    >
                      Latest
                    </div>
                    <div
                      onClick={() => {
                        setSelectedPatientList({
                          type: "Searched",
                          data: searchedPatientsList,
                        });
                      }}
                      className={
                        "py-1 px-2 cursor-pointer rounded border border-gray-200 font-semibold " +
                        (selectedPatientList.type === "Searched"
                          ? "bg-gray-200 text-gray-800"
                          : "text-gray-50")
                      }
                    >
                      Searched
                    </div>
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {selectedPatientList.data.length > 0 ? (
                      selectedPatientList.data.map((patient) => (
                        <div
                          key={patient._id}
                          onClick={() => {
                            setSelectedPatient(patient);
                            setDropDown(!dropDown);
                          }}
                          className="p-1 cursor-pointer border-b border-gray-600 hover:rounded-lg hover:bg-gray-600 px-6 text-white"
                        >
                          {patient.name + ", UHID: " + patient.uhid}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 font-semibold">
                        No Patient
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col lg:flex-row justify-center items-center gap-2">
          <div className="flex flex-col justify-center items-center p-2 rounded-lg border border-gray-700">
            <input
              type="text"
              placeholder="Serch Medicine"
              onChange={(e) => {
                handleSearchMedicine(e.target.value);
              }}
              className="rounded-full bg-gray-700 outline-none focus:ring-2 focus:ring-gray-600 px-3 py-1"
            />
            <div className="max-h-64 overflow-y-auto bg-gray-700 py-2 px-3 rounded-xl my-2">
              {searchedMedicines.length > 0 ? (
                searchedMedicines.map((medicine, index) => (
                  <div
                    className="flex gap-2 items-center my-1 w-full"
                    key={index}
                  >
                    <input
                      type="checkbox"
                      className="size-5 cursor-pointer"
                      checked={selectedMedicines.some(
                        (m) => m._id === medicine._id
                      )}
                      onChange={() => handleCheckboxChange(medicine)}
                      id={index}
                    />
                    <label
                      htmlFor={index}
                      className="bg-gray-800 hover:bg-gray-900 text-white font-semibold text-sm px-2 py-1 rounded-lg cursor-pointer"
                    >
                      {medicine.salts.name.length > 30
                        ? medicine.name +
                          " - " +
                          medicine.salts.name.substring(0, 30) +
                          "..."
                        : medicine.name + " - " + medicine.salts.name}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm">No Medicine</div>
              )}
            </div>
          </div>
          <div className="border border-gray-700 p-2 rounded-lg text-white">
            <div>Selected Medicines</div>
            <hr className="border-1 border-gray-700 my-1" />
            <div className="max-h-64 overflow-y-auto p-2">
              {selectedMedicines.length > 0 ? (
                selectedMedicines.map((medicine) => (
                  <div
                    key={medicine._id}
                    className="lg:flex items-center gap-1 text-white"
                  >
                    <div className="bg-gray-800 my-1 w-full text-sm font-semibold px-2 py-1 rounded-lg">
                      {medicine.name + " - " + medicine.salts?.name}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      {medicine.isTablets ? (
                        <>
                          <input
                            type="number"
                            placeholder="Strips"
                            value={medicine.quantity.strips}
                            onChange={(e) =>
                              handleInputChange(
                                medicine._id,
                                "strips",
                                e.target.value
                              )
                            }
                            min={0}
                            className="w-20 text-sm text-gray-100 bg-gray-800 outline-none focus:ring-1 ring-gray-700 rounded-lg py-1 px-2"
                          />
                          <input
                            type="number"
                            placeholder="Tablets"
                            value={medicine.quantity.tablets}
                            onChange={(e) =>
                              handleInputChange(
                                medicine._id,
                                "tablets",
                                e.target.value
                              )
                            }
                            min={0}
                            className="w-20 text-sm text-gray-100 bg-gray-800 outline-none focus:ring-1 ring-gray-700 rounded-lg py-1 px-2"
                          />
                        </>
                      ) : (
                        <>
                          <input
                            type="number"
                            placeholder="Quantity"
                            value={medicine.quantity.normalQuantity}
                            onChange={(e) =>
                              handleInputChange(
                                medicine._id,
                                "normalQuantity",
                                e.target.value
                              )
                            }
                            min={0}
                            className="w-[164px] text-sm text-gray-100 bg-gray-800 outline-none focus:ring-1 ring-gray-700 rounded-lg py-1 px-2"
                          />
                        </>
                      )}
                      <div
                        onClick={() => removeMedicine(medicine._id)}
                        className="text-red-600 hover:bg-red-300 cursor-pointer p-1 rounded-lg"
                      >
                        <RxCross2 />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col justify-center items-center text-gray-700 font-semibold">
                  <IoAddCircle className="size-6" />
                  <div>No Selected Medicine</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {requestedMedicineDetails && (
          <div className="px-2">
            <div className=" mx-auto my-2 border rounded-lg border-gray-700">
              <div className="py-2 border-b border-gray-700">
                <div className="text-center text-blue-500 text-lg">
                  Requested Medicine Details
                </div>
                <div className="flex items-center justify-around flex-wrap px-2 text-sm mt-2">
                  <div className="flex items-center gap-2">
                    <FaCircleDot className="text-green-500" />
                    <div className="text-gray-400 font-semibold">InStock</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCircleDot className="text-yellow-500" />
                    <div className="text-gray-400 font-semibold">
                      Insufficient Stock
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCircleDot className="text-red-500" />
                    <div className="text-gray-400 font-semibold">
                      Out of Stock
                    </div>
                  </div>
                </div>
                <div className="flex items-center flex-wrap font-semibold text-gray-200 text-sm px-2">
                  <div className="w-[5%]"></div>
                  <div className="w-[45%] text-start">Name</div>
                  <div className="w-[25%] text-start">Qty</div>
                  <div className="w-[10%]">MRP</div>
                  <div className="w-[15%] text-end">Total</div>
                </div>
              </div>
              <div className="py-1 text-white">
                {requestedMedicineDetails.map((medicine, index) => {
                  let medicineDetails = medicines.find(
                    (m) => m._id === medicine.medicineId
                  );
                  const totalStripsAllocated = medicine.allocatedQuantities
                    ? medicine.allocatedQuantities.reduce(
                        (total, batch) => total + batch.stripsAllocated,
                        0
                      )
                    : "-";
                  const totalTabletsAllocated = medicine.allocatedQuantities
                    ? medicine.allocatedQuantities.reduce(
                        (total, batch) => total + batch.tabletsAllocated,
                        0
                      )
                    : "-";
                  const totalPrice = medicine.allocatedQuantities
                    ? medicine.allocatedQuantities.reduce(
                        (total, batch) => total + batch.price,
                        0
                      )
                    : "--";
                  const MRP =
                    medicine.allocatedQuantities?.length > 0
                      ? parseFloat(
                          medicine.allocatedQuantities[0].sellingPrice?.toFixed(
                            2
                          )
                        )
                      : "--";
                  return (
                    <div key={index}>
                      <div
                        onClick={() => {
                          setActiveIndex(activeIndex === index ? null : index);
                        }}
                        className="w-full flex items-center px-2 cursor-pointer hover:bg-gray-800"
                      >
                        <FaCircleDot
                          className={`w-[5%] ${
                            medicine.status === "Fulfilled"
                              ? "text-green-500"
                              : medicine.status === "Insufficient Stock"
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                        />

                        <div
                          title={medicineDetails.name}
                          className="w-[45%] text-start px-1 line-clamp-1"
                        >
                          {medicineDetails.name}
                        </div>
                        <div className="w-[25%] text-sm text-start text-gray-300">
                          {medicineDetails.isTablets ? (
                            <>
                              {totalStripsAllocated > 0 &&
                                totalStripsAllocated + " Strips"}
                              {totalStripsAllocated > 0 &&
                                totalTabletsAllocated > 0 &&
                                ", "}
                              {totalTabletsAllocated > 0
                                ? totalTabletsAllocated + " Tablets"
                                : ""}
                            </>
                          ) : (
                            <>{totalStripsAllocated + " Pcs"}</>
                          )}
                        </div>
                        <div className="text-center w-[10%]">{MRP + "/-"}</div>
                        <div className="text-end w-[15%]">
                          {totalPrice + "/-"}
                        </div>
                      </div>
                      {activeIndex === index && (
                        <div className="bg-gray-800 w-full p-1 text-sm">
                          {medicine.allocatedQuantities?.length > 0 ? (
                            <>
                              <div className="flex items-center justify-between text-sm font-semibold text-gray-200 border-b border-gray-700">
                                <div className="w-[5%]"></div>
                                <div className="w-[25%] text-start">Batch</div>
                                <div className="w-[20%] text-start">Expiry</div>
                                <div className="w-[25%] text-start">Qty</div>
                                <div className="w-[10%]">MRP</div>
                                <div className="w-[15%] text-end">Total</div>
                              </div>
                              {medicine.allocatedQuantities.map(
                                (batch, batchIndex) => (
                                  <div
                                    key={batchIndex}
                                    className="flex items-center justify-between text-sm text-gray-300"
                                  >
                                    <div className="w-[5%]">
                                      {batchIndex + 1 + "."}
                                    </div>
                                    <div className="w-[25%] text-start px-1 line-clamp-1">
                                      {batch.batchName}
                                    </div>
                                    <div className="w-[20%] text-start px-1">
                                      {formatDateToIST(batch.expiryDate)}
                                    </div>
                                    <div className="w-[25%] text-start text-gray-300">
                                      {medicineDetails.isTablets ? (
                                        <>
                                          {batch.stripsAllocated > 0 &&
                                            batch.stripsAllocated + " Strips"}
                                          {batch.stripsAllocated > 0 &&
                                            batch.tabletsAllocated > 0 &&
                                            ", "}
                                          {batch.tabletsAllocated > 0
                                            ? batch.tabletsAllocated +
                                              " Tablets"
                                            : ""}
                                        </>
                                      ) : (
                                        <>{batch.quantity + " Pcs"}</>
                                      )}
                                    </div>
                                    <div className="text-center w-[10%]">
                                      {parseFloat(
                                        batch.sellingPrice?.toFixed(2)
                                      ) + "/-"}
                                    </div>
                                    <div className="text-end w-[15%]">
                                      {parseFloat(batch.price?.toFixed(2)) +
                                        "/-"}
                                    </div>
                                  </div>
                                )
                              )}
                            </>
                          ) : (
                            <div className="text-center text-gray-300">
                              No any qunatity available
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-700 py-1 text-white">
                <div className="flex justify-end gap-3 items-center px-2 text-md">
                  <div className="font-semibold text-center text-blue-500">
                    Total:
                  </div>
                  <div className="">{getGrandTotal() + "/-"}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        <hr className="border-t border-slate-900 w-full my-2" />
        {message && (
          <div className="my-1 text-center text-red-500">{message}</div>
        )}
        <div className="flex px-4 gap-3 justify-end">
          <div
            className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
            onClick={() => {
              setEditExpressInvoice(null);
              setRequestedMedicineDetails(null);
              setNewInvoiceSection((newInvoiceSection) => !newInvoiceSection);
            }}
          >
            Cancel
          </div>
          <button
            onClick={onSubmit}
            className={
              "w-20 h-8 py-1 flex items-center justify-center gap-2 rounded-lg font-semibold text-white " +
              (submitting || selectedMedicines.length === 0 || !selectedPatient
                ? "bg-gray-500  "
                : requestedMedicineDetails
                ? "bg-green-500"
                : "bg-red-500")
            }
            disabled={
              submitting || selectedMedicines.length === 0 || !selectedPatient
            }
          >
            {submitting ? <Loading size={15} /> : <></>}
            {submitting
              ? "Wait..."
              : requestedMedicineDetails
              ? "Confirm"
              : "Proceed"}
          </button>
        </div>
      </div>
    </>
  );
}

export default NewPharmacyExpressInvoice;
