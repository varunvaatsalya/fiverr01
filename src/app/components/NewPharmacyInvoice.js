"use client";
import React, { useEffect, useMemo, useState } from "react";
import { IoAddCircle } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import Loading from "./Loading";
import ToggleSwitch from "./ToggleSwitch";
import { FaCircleDot } from "react-icons/fa6";
import { formatDateToIST } from "../utils/date";
import { showError, showSuccess } from "../utils/toast";
import { RiDiscountPercentFill } from "react-icons/ri";
import { FaAngleDown, FaAngleRight, FaCheckCircle } from "react-icons/fa";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { GrHistory } from "react-icons/gr";
import { CiSearch } from "react-icons/ci";
import NewPharmacyInvoiceBackDate from "./NewPharmacyInvoiceBackDate";
import { Textarea } from "@/components/ui/textarea";

function NewPharmacyInvoice({
  setNewInvoiceSection,
  // editInvoice,
  // setEditInvoice,
  setPrintInvoice,
  setInvoices,
  expressData,
  setExpressBills,
  setExpressData,
}) {
  const [patientOptions, setPatientOptions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [requestedMedicineDetails, setRequestedMedicineDetails] =
    useState(null);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [discountToAllMedicine, setDiscountToAllMedicine] = useState(true);
  const [discount, setDiscount] = useState("");

  const [query, setQuery] = useState("");
  const [medQuery, setMedQuery] = useState("");

  const [isPatientListFocused, setIsPatientListFocused] = useState(false);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentMedicines, setRecentMedicine] = useState([]);
  const [isMedicineListFocused, setIsMedicineListFocused] = useState(false);
  const [isAddInfoOpen, setIsAddInfoOpen] = useState(null);
  const [comments, setComments] = useState("");
  const [payments, setPayments] = useState([
    { type: "Cash", amount: 0 },
    { type: "Card", amount: 0 },
    { type: "UPI", amount: 0 },
  ]);
  const getTotal = () =>
    payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalEntered = useMemo(() => getTotal(), [payments]);

  const handleChange = (index, value) => {
    const updated = [...payments];
    updated[index].amount = parseFloat(value || 0);
    console.log(updated);
    setPayments(updated);
  };

  useEffect(() => {
    if (expressData) {
      setSelectedPatient(expressData.patientId);
      const outputArray = expressData.medicines.map((item) => ({
        _id: item.medicineId._id,
        name: item.medicineId.name,
        isTablets: item.medicineId.isTablets,
        salts: { name: item.medicineId.salts.name },
        packetSize: item.medicineId.packetSize,
        quantity: item.quantity,
      }));
      console.log(expressData);
      setSelectedMedicines(outputArray);
    }
  }, [expressData]);

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch(`/api/newPharmacyInvoice?info=1`);
        result = await result.json();
        if (result.success) {
          setPatientOptions(result.patientsList);
          setRecentPatients(result.patientsList);
          setRecentMedicine(result.medicinesList);
          setMedicineOptions(result.medicinesList);
        } else {
          showError(result.message);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query) {
        if (recentPatients.length > 0) setPatientOptions(recentPatients);
        return;
      }
      try {
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
          setPatientOptions(result.patients);
          console.log(result.patients);
        } else {
          console.error("Failed to fetch patients", result.message);
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const medTimer = setTimeout(async () => {
      if (!medQuery) {
        if (recentMedicines.length > 0) setMedicineOptions(recentMedicines);
        console.log(recentMedicines);
        return;
      }
      try {
        let result = await fetch(`/api/searchMedicine`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: medQuery,
          }),
        });
        result = await result.json();
        if (result.success) {
          setMedicineOptions(result.medicines);
        }
      } catch (err) {
        console.error("Error fetching medicines:", err);
      }
    }, 350);
    return () => clearTimeout(medTimer);
  }, [medQuery]);

  const handleCheckboxChange = (medicine) => {
    setRequestedMedicineDetails(null);
    setDiscount("");
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
    setDiscount("");
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
    setDiscount("");
    setSelectedMedicines(selectedMedicines.filter((m) => m._id !== id));
  };

  function parseData() {
    try {
      const parsed = selectedMedicines.map((medicine) => {
        const newQuantity = {
          strips: Number(medicine.quantity.strips) || 0,
          tablets: Number(medicine.quantity.tablets) || 0,
          normalQuantity: Number(medicine.quantity.normalQuantity) || 0,
        };

        const isTabletInvalid =
          medicine.isTablets &&
          newQuantity.strips <= 0 &&
          newQuantity.tablets <= 0;

        const isNormalInvalid =
          !medicine.isTablets && newQuantity.normalQuantity <= 0;

        if (isTabletInvalid || isNormalInvalid) {
          throw new Error(`Set the correct quantity in : ${medicine.name}`);
        }

        return {
          medicine,
          quantity: newQuantity,
        };
      });

      return { parsedData: parsed, error: null };
    } catch (error) {
      return { parsedData: null, error: error.message };
    }
  }

  const onSubmit = async () => {
    try {
      const { parsedData, error } = parseData();
      if (error) {
        showError(error);
        return;
      }
      let data = parsedData.map((med) => ({
        medicineId: med.medicine._id,
        isTablets: med.medicine.isTablets,
        quantity: med.quantity,
      }));

      setSubmitting(true);
      try {
        let result = await fetch("/api/newPharmacyInvoice?info=1", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestedMedicine: data,
            discountToAllMedicine,
          }),
        });
        result = await result.json();
        if (result.success) {
          console.log(result.requestResults);
          setRequestedMedicineDetails(result.requestResults);
        } else {
          showError(result.message);
        }
      } catch (error) {
        showError("Error in submitting application");
        console.error("Error submitting application:", error);
      }
      setSubmitting(false);
    } catch (error) {
      showError(error.message);
    }
  };

  const handleConfirm = async (isMakeExpressInvoice = false) => {
    try {
      const { parsedData, error } = parseData();
      if (error) {
        showError(error);
        return;
      }
      if (selectedPaymentMode === "Credit-Doctor" && !comments)
        showError("Please Fill the reason for choosing this payment mode");
      let data = parsedData.map((med) => ({
        medicineId: med.medicine._id,
        isTablets: med.medicine.isTablets,
        quantity: med.quantity,
      }));

      let url = "/api/newPharmacyInvoice";
      let payload = {
        requestedMedicine: data,
        selectedPatient: selectedPatient._id,
        selectedPaymentMode,
        discount,
        discountToAllMedicine,
        ...(selectedPaymentMode === "mixed" && { payments }),
        comments,
      };

      if (isMakeExpressInvoice) {
        if (expressData) {
          showError("Already Express Invoice Created");
          return;
        } else {
          url = "/api/newExpressBill";
          payload = {
            patientId: selectedPatient._id,
            medicines: data,
          };
        }
      }

      setSubmitting(true);
      try {
        let result = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        result = await result.json();
        if (result.success) {
          showSuccess(result.message, { position: "top-right" });
          setRequestedMedicineDetails(null);
          setSelectedPatient(null);
          setSelectedPaymentMode(null);
          setDiscount("");
          setSelectedMedicines([]);
          if (setInvoices && !isMakeExpressInvoice) {
            setInvoices((invoices) => [result.invoice, ...invoices]);
          }
          if (expressData) {
            let result1 = await fetch("/api/newExpressBill", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: expressData._id,
              }),
            });
            result1 = await result1.json();
            if (result1.success) {
              setExpressBills((prevBills) =>
                prevBills.filter((bill) => bill._id !== expressData._id)
              );
              setExpressData(null);
            }
          }
          setPrintInvoice(result.invoice);
          setTimeout(() => {
            if (setNewInvoiceSection) {
              setNewInvoiceSection(false);
            }
          }, 1500);
        } else showError(result.message);
      } catch (error) {
        showError("Error in submitting application");
        console.error("Error submitting application:", error);
      }
      setSubmitting(false);
    } catch (error) {
      showError(error.message);
    }
  };

  const grandTotal = useMemo(() => {
    return parseFloat(
      requestedMedicineDetails
        ?.reduce((sum, medicine) => {
          if (medicine.allocatedQuantities?.length > 0) {
            const totalPrice = medicine.allocatedQuantities.reduce(
              (batchSum, batch) => batchSum + batch.price,
              0
            );
            return sum + totalPrice;
          }
          return sum;
        }, 0)
        .toFixed(2)
    );
  }, [requestedMedicineDetails]);

  const discountedTotal = useMemo(() => {
    if (!discount || discount < 0 || discount > 5) return grandTotal;

    return parseFloat(
      requestedMedicineDetails
        ?.reduce((sum, medicine) => {
          if (medicine.allocatedQuantities?.length > 0) {
            let totalPrice = medicine.allocatedQuantities.reduce(
              (batchSum, batch) => batchSum + batch.price,
              0
            );
            if (medicine.isDiscountApplicable !== false) {
              totalPrice = (totalPrice * (100 - discount)) / 100;
            }
            return sum + totalPrice;
          }
          return sum;
        }, 0)
        .toFixed(2)
    );
  }, [requestedMedicineDetails, discount, grandTotal]);

  return (
    <>
      <div className="w-[95%] md:w-[86%] min-h-[70vh] flex flex-col text-center border border-slate-900 rounded-xl mx-auto my-2 pb-2">
        <div className="text-center py-2 rounded-t-lg bg-slate-900 text-xl text-white font-semibold">
          New Invoice
        </div>
        <div className="flex-grow">
          <div className="p-2 flex flex-col items-center text-white">
            {selectedPatient ? (
              <div className="w-full flex flex-wrap justify-around gap-2 my-1">
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
                  Change Patient
                </button>
              </div>
            ) : (
              <div className="relative w-full md:w-4/5 lg:w-3/5">
                <Command className="mb-2 px-3 py-1 text-white bg-gray-900 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out">
                  <CommandInput
                    placeholder="Search Patient..."
                    autoFocus
                    onFocus={() => setIsPatientListFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setIsPatientListFocused(false), 250)
                    }
                    onValueChange={(value) => {
                      setQuery(value);
                    }}
                  />
                  {isPatientListFocused && (
                    <CommandList className="absolute bg-gray-800 rounded-lg max-h-48 top-12 left-0 my-1 w-full z-50">
                      {patientOptions.map((p) => (
                        <CommandItem
                          key={p._id}
                          value={`${p.name} (UHID: ${p.uhid})`}
                          onSelect={() => {
                            setSelectedPatient(p);
                            setPatientOptions([]);
                          }}
                        >
                          <span className="text-lg">
                            {query.trim() ? <CiSearch /> : <GrHistory />}
                          </span>
                          <span className="truncate">{`${p.name} (UHID: ${p.uhid})`}</span>
                        </CommandItem>
                      ))}
                    </CommandList>
                  )}
                </Command>
              </div>
            )}
            <div className="relative w-full md:w-4/5 lg:w-3/4">
              <Command className="mb-2 px-3 py-1 text-white w-full bg-gray-900 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out">
                <CommandInput
                  placeholder="Search Medicine..."
                  onFocus={() => setIsMedicineListFocused(true)}
                  onBlur={() =>
                    setTimeout(() => setIsMedicineListFocused(false), 250)
                  }
                  onValueChange={(value) => {
                    setMedQuery(value);
                  }}
                />
                {isMedicineListFocused && (
                  <CommandList className="absolute bg-gray-600 rounded-lg max-h-52 top-12 left-0 my-1 w-full z-50">
                    {medicineOptions.map((m) => {
                      const alreadySelected = selectedMedicines.some(
                        (med) => med._id === m._id
                      );
                      let medName =
                        m.salts.name.length > 30
                          ? m.name +
                            " - " +
                            m.salts.name.substring(0, 30) +
                            "..."
                          : m.name + " - " + m.salts.name;

                      return (
                        <CommandItem
                          key={m._id}
                          value={medName}
                          onSelect={() => {
                            if (!alreadySelected) {
                              handleCheckboxChange(m);
                            }
                          }}
                          className="flex items-center justify-between gap-2 px-2 py-1"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {medQuery.trim() ? <CiSearch /> : <GrHistory />}
                            </span>
                            <span className="truncate">{medName}</span>
                          </div>
                          {alreadySelected && (
                            <FaCheckCircle className="size-4" />
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandList>
                )}
              </Command>
            </div>
            <div className=" w-full md:w-4/5 border border-gray-700 p-2 rounded-lg text-white">
              <div>Selected Medicines</div>
              <hr className="border-1 border-gray-700" />
              <div className="max-h-64 overflow-y-auto p-2">
                {selectedMedicines.length > 0 ? (
                  selectedMedicines.map((medicine) => (
                    <div
                      key={medicine._id}
                      className="lg:flex items-center gap-1 text-white"
                    >
                      <div className="bg-gray-800 my-1 w-full text-sm text-start font-semibold px-2 py-1 rounded-lg">
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
          <div className="w-full flex ">
            <button
              disabled={!selectedPatient || selectedMedicines.length <= 0}
              onClick={() => {
                let { parsedData, error } = parseData();
                if (error) {
                  showError(error);
                  return;
                }
                setIsAddInfoOpen(parsedData);
              }}
              className="text-blue-800 disabled:text-gray-400 px-2 disabled:no-underline hover:underline underline-offset-2 text-sm"
            >
              additional Info
            </button>
          </div>
          {isAddInfoOpen !== null && (
            <NewPharmacyInvoiceBackDate
              selectedPatient={selectedPatient}
              isAddInfoOpen={isAddInfoOpen}
              setIsAddInfoOpen={setIsAddInfoOpen}
              setNewInvoiceSection={setNewInvoiceSection}
              setPrintInvoice={setPrintInvoice}
            />
          )}
          {requestedMedicineDetails && (
            <div className="px-2">
              <div className="md:w-3/4 mx-auto my-2 border rounded-lg border-gray-700">
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
                    {/* <div className="w-[10%]">MRP</div> */}
                    <div className="w-[25%] text-end">Total</div>
                  </div>
                </div>
                <div className="py-1 text-white">
                  {requestedMedicineDetails.map((medicine, index) => {
                    let medicineDetails = selectedMedicines?.find(
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
                    // const MRP =
                    //   medicine.allocatedQuantities?.length > 0
                    //     ? parseFloat(
                    //         medicine.allocatedQuantities[0].sellingPrice?.toFixed(
                    //           2
                    //         )
                    //       )
                    //     : "--";
                    return (
                      <div key={index}>
                        <div
                          onClick={() => {
                            setActiveIndex(
                              activeIndex === index ? null : index
                            );
                          }}
                          className="w-full flex items-center px-2 cursor-pointer hover:bg-gray-900"
                        >
                          <div className="w-[5%] flex gap-0.5 items-center">
                            {activeIndex === index ? (
                              <FaAngleDown className="size-3 text-gray-500" />
                            ) : (
                              <FaAngleRight className="size-3 text-gray-500" />
                            )}
                            <FaCircleDot
                              className={`size-4 ${
                                medicine.status === "Fulfilled"
                                  ? "text-green-500"
                                  : medicine.status === "Insufficient Stock"
                                  ? "text-yellow-500"
                                  : "text-red-500"
                              }`}
                            />
                          </div>

                          <div
                            title={medicineDetails?.name}
                            className="w-[45%] text-start px-1 line-clamp-1"
                          >
                            {medicineDetails?.name}
                          </div>
                          <div className="w-[25%] text-sm text-start text-gray-300">
                            {medicineDetails?.isTablets ? (
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
                          {/* <div className="text-center w-[10%]">
                            {MRP + "/-"}
                          </div> */}
                          <div className=" w-[25%] flex items-center justify-end gap-1">
                            {medicine.isDiscountApplicable && discount && (
                              <RiDiscountPercentFill className="text-blue-400 size-4" />
                            )}
                            {totalPrice}/-
                          </div>
                        </div>
                        {activeIndex === index && (
                          <div className="bg-gray-900 w-full p-1 text-sm">
                            {medicine.allocatedQuantities?.length > 0 ? (
                              <>
                                <div className="flex items-center justify-between text-sm font-semibold text-gray-200 border-b border-gray-700">
                                  <div className="w-[5%]"></div>
                                  <div className="w-[25%] text-start">
                                    Batch
                                  </div>
                                  <div className="w-[20%] text-start">
                                    Expiry
                                  </div>
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
                                        {medicineDetails?.isTablets ? (
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
                                          <>{batch.stripsAllocated + " Pcs"}</>
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
                    <div className="">{grandTotal + "/-"}</div>
                  </div>
                  <div className="flex justify-end items-center gap-3 px-2 my-1">
                    <div className="font-semibold flex flex-col-reverse md:flex-row md:gap-1 items-center justify-end">
                      <span className="text-gray-300 text-xs font-light">
                        {"(Discount Applicable only on selected medicines)"}
                      </span>
                      Discount:
                    </div>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => {
                        setDiscount(e.target.value);
                      }}
                      min={0}
                      max={5}
                      className="outline-none bg-gray-800 rounded-lg text-sm px-2 py-1 w-32"
                      placeholder="Upto 5%"
                    />
                  </div>
                  {discount === "" ? (
                    <></>
                  ) : discount >= 0 && discount <= 5 ? (
                    <div className="flex justify-end gap-3 items-center px-2 text-md">
                      <div className="font-semibold text-center text-blue-500">
                        Grand Total:
                      </div>
                      <div className="">
                        {discountedTotal.toString() + "/-"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-500 px-2 text-end">
                      Discount must be between 0 to 5
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {requestedMedicineDetails && grandTotal > 0 && (
            <>
              <div className="mt-1 mb-4 mx-auto p-2 flex flex-col-reverse md:flex-row justify-center items-center gap-2 w-4/5">
                {!expressData && (
                  <div>
                    <button
                      disabled={
                        submitting ||
                        selectedMedicines.length === 0 ||
                        !selectedPatient ||
                        expressData
                      }
                      onClick={() => {
                        handleConfirm(true);
                      }}
                      className="px-2 py-1 text-nowrap border border-slate-300 text-gray-400 hover:text-gray-100 dark:border-slate-700 rounded-lg text-sm"
                    >
                      {submitting ? "Generating..." : "Generate Exp Invoice"}
                    </button>
                    <div className="text-gray-400 text-[10px] text-nowrap">
                      In case of payment delay
                    </div>
                  </div>
                )}
                <select
                  id="paymentMode"
                  value={selectedPaymentMode}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value === "Credit-Others") {
                      const result = window.confirm(
                        "Do you want to select Credit-Others payment mode?"
                      );
                      if (result) {
                        setSelectedPaymentMode(value);
                      } else {
                        setSelectedPaymentMode("");
                      }
                    } else setSelectedPaymentMode(value);
                  }}
                  className=" px-4 py-3 text-white flex-1 mx-auto bg-gray-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 transition duration-150 ease-in-out"
                >
                  <option value="">-- Payment Mode --</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Credit-Insurance">
                    {"Credit (Insurance)"}
                  </option>
                  <option value="Credit-Doctor">{"Credit (Doctor)"}</option>
                  <option value="Credit-Society">{"Credit (Society)"}</option>
                  <option value="Credit-Others">{"Credit (Others)"}</option>
                  <option value="Package-Discount">{"Package Discount"}</option>
                  <option value="mixed">Mixed</option>
                  {/*!ipdPrice && <option value="Insurence">Insurence Patient</option>*/}
                </select>
              </div>
              {selectedPaymentMode === "mixed" && (
                <div className="w-full flex justify-center">
                  <div className="p-2 mx-auto border rounded-lg border-slate-700 flex flex-col items-center justify-center">
                    <div className="text-center font-semiboldp-2">
                      Payment Details
                    </div>
                    <hr className="border-t border-gray-700 w-full my-1" />
                    {payments.map((payment, index) => (
                      <div
                        key={payment.type}
                        className="flex justify-end items-center gap-3 px-2 my-1"
                      >
                        <div className="font-semibold w-12 capitalize">
                          {payment.type}:
                        </div>
                        <input
                          type="number"
                          value={payment.amount || ""}
                          onChange={(e) => handleChange(index, e.target.value)}
                          min={0}
                          className="outline-none bg-gray-800 rounded-lg text-sm px-2 py-1 w-32"
                          placeholder="₹ amount"
                        />
                      </div>
                    ))}
                    <hr className="border border-gray-600 w-full my-1" />
                    <div className="flex justify-end items-center gap-3 px-2">
                      <div className="font-semibold w-12 capitalize">
                        Total:
                      </div>
                      <div
                        className={
                          "w-32 font-semibold " +
                          (totalEntered !== discountedTotal
                            ? "text-red-500"
                            : "text-green-500")
                        }
                      >
                        {totalEntered + "/-"}
                      </div>
                    </div>
                    <div className="flex justify-end items-center gap-3 px-2 text-sm border-t border-gray-700">
                      <div className="font-semibold w-12 capitalize">
                        Remaining:
                      </div>
                      <div className={"w-32"}>
                        {parseFloat(
                          (discountedTotal - totalEntered).toFixed(2)
                        ) + "/-"}
                      </div>
                    </div>
                    {/* Validation */}
                    {totalEntered > discountedTotal && (
                      <div className="text-red-500 text-sm mt-2">
                        Total payment exceeds the bill amount of ₹
                        {discountedTotal}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {(selectedPaymentMode === "Credit-Doctor" ||
                selectedPaymentMode === "Package-Discount") && (
                <div className="max-w-3xl mx-auto px-2">
                  <Textarea
                    placeholder="Enter the reason for choosing the Credit (Doctor) payment mode"
                    value={comments || ""}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>
              )}
            </>
          )}
        </div>
        <hr className="border-t border-slate-900 w-full my-2" />
        <div className="flex justify-between items-center px-2">
          <ToggleSwitch
            isToggled={discountToAllMedicine}
            onToggle={() => {
              setDiscountToAllMedicine(!discountToAllMedicine);
              setRequestedMedicineDetails(null);
              setDiscount("");
            }}
            label={
              discountToAllMedicine
                ? "Toggle to discount on selected medicine"
                : "Toggle to discount on all medicine"
            }
          />
          <div className="flex px-4 gap-3 justify-end">
            {setNewInvoiceSection && (
              <div
                className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
                onClick={() => {
                  setNewInvoiceSection(
                    (newInvoiceSection) => !newInvoiceSection
                  );
                }}
              >
                Cancel
              </div>
            )}
            <button
              onClick={
                requestedMedicineDetails && selectedPaymentMode
                  ? () => handleConfirm()
                  : onSubmit
              }
              className={
                "w-20 h-8 py-1 flex items-center justify-center gap-2 rounded-lg font-semibold text-white disabled:bg-gray-500 " +
                (requestedMedicineDetails && selectedPaymentMode
                  ? "bg-green-500"
                  : "bg-red-500")
              }
              disabled={
                submitting ||
                selectedMedicines.length === 0 ||
                !selectedPatient ||
                (discount && (discount < 1 || discount > 5)) ||
                (selectedPaymentMode === "mixed" &&
                  Math.abs(
                    Math.floor(totalEntered) - Math.floor(discountedTotal)
                  ) >= 1) ||
                ((selectedPaymentMode === "Credit-Doctor" ||
                  selectedPaymentMode === "Package-Discount") &&
                  !comments)
              }
            >
              {submitting ? <Loading size={15} /> : <></>}
              {submitting
                ? "Wait..."
                : requestedMedicineDetails && selectedPaymentMode
                ? "Confirm"
                : "Proceed"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewPharmacyInvoice;
