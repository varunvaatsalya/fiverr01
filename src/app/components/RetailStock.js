"use client";
import React, { useEffect, useState } from "react";
import { ImBoxRemove } from "react-icons/im";
import { BiInjection } from "react-icons/bi";
import { TiWarning } from "react-icons/ti";
import Loading from "./Loading";
import { IoIosRemoveCircle } from "react-icons/io";
import { showError, showSuccess } from "../utils/toast";
import { useStockType } from "../context/StockTypeContext";
import { format } from "date-fns";
import { FaFire } from "react-icons/fa6";

function RetailStock({
  medicineStock,
  setMedicineStock,
  selectedLetter,
  query,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [requestedMedicine, setRequestedMedicine] = useState(null);
  const [requestedQuantity, setRequestedQuantity] = useState("");
  const [enteredRemainingQuantity, setEnteredRemainingQuantity] = useState("");
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");
  const [message, setMessage] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [filteredMedicines, setFilteredMedicines] = useState(
    medicineStock?.medicines
  );

  const sectionType = useStockType();

  useEffect(() => {
    setFilteredMedicines(medicineStock?.medicines);
  }, [medicineStock]);
  useEffect(() => {
    if (query) {
      setFilteredMedicines(
        medicineStock?.medicines.filter((medicine) =>
          medicine.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      setFilteredMedicines(medicineStock?.medicines);
    }
  }, [query]);

  async function handleCreateRequest() {
    setSubmitting(true);
    try {
      let result = await fetch("/api/stockRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify({
          requests: [
            {
              medicine: requestedMedicine._id,
              medicineName: requestedMedicine.name,
              requestedQuantity,
              enteredRemainingQuantity,
            },
          ],
          sectionType,
        }),
      });

      result = await result.json();
      setMessage(result.message);
      if (result.success) {
        setResponseMessage(result.responses[0]?.message);
        if (result.responses[0].success) {
          setMedicineStock((prevStock) => ({
            ...prevStock,
            [selectedLetter]: {
              ...prevStock[selectedLetter], // Existing data preserve
              medicines: prevStock[selectedLetter].medicines.map((medicine) =>
                medicine._id ===
                result.responses[0].newMedicineStockRequest.medicine
                  ? {
                      ...medicine,
                      requests: [
                        ...medicine.requests,
                        result.responses[0].newMedicineStockRequest,
                      ],
                    }
                  : medicine
              ),
            },
          }));
        }
        setRequestedQuantity("");
        setEnteredRemainingQuantity("");
        // setMessage("");
        setTimeout(() => {
          setRequestedMedicine(null);
          setMessage("");
          setResponseMessage("");
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSetMaxQty(id) {
    setSubmitting(true);
    try {
      let result = await fetch("/api/newMedicine?maxqty=1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, retailsMaxQty: maxQty, sectionType }),
      });
      result = await result.json();
      if (result.success) {
        const updatedMedicines = filteredMedicines.map((medicine) =>
          medicine._id === id
            ? {
                ...medicine,
                maximumStockCount: {
                  ...medicine.maximumStockCount,
                  retails: maxQty,
                },
              }
            : medicine
        );
        setFilteredMedicines(updatedMedicines);
        setMaxQty("");
      } else showError(result.message);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSetMinQty(id) {
    setSubmitting(true);
    try {
      let result = await fetch("/api/newMedicine?minqty=1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, retailsMinQty: minQty, sectionType }),
      });
      result = await result.json();
      if (result.success) {
        const updatedMedicines = filteredMedicines.map((medicine) =>
          medicine._id === id
            ? {
                ...medicine,
                minimumStockCount: {
                  ...medicine.minimumStockCount,
                  retails: minQty,
                },
              }
            : medicine
        );
        setFilteredMedicines(updatedMedicines);
        setMinQty("");
      } else showError(result.message);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResolveRequest(status, id, medId) {
    setIsReceiving(true);
    try {
      // Make a POST request to the API with the request ID
      const response = await fetch(
        `/api/stockRequest/receivedStock?status=${status}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestId: id, sectionType }), // Send requestId in the body
        }
      );

      // Parse the JSON response
      const result = await response.json();
      showSuccess(result.message);
      if (result.success) {
        setMedicineStock((prevStock) => ({
          ...prevStock,
          [selectedLetter]: {
            ...prevStock[selectedLetter], // Existing data preserve
            medicines: prevStock[selectedLetter].medicines.map((medicine) =>
              medicine._id === medId
                ? {
                    ...medicine,
                    requests: [],
                  }
                : medicine
            ),
          },
        }));
      }
    } catch (error) {
      console.error("Error resolving the request:", error);
      showError("An error occurred while resolving the request.");
    } finally {
      setIsReceiving(false);
    }
  }

  return (
    <div className="p-2 w-full md:w-4/5 lg:w-3/4 mx-auto text-gray-900">
      <div className="w-full rounded-full bg-gray-900 p-2 flex font-semibold text-gray-100 justify-around items-center">
        <div className="w-2/5">Name</div>
        <div className="w-2/5 text-center">Stock</div>
      </div>
      {filteredMedicines ? (
        filteredMedicines.map((medicine, index) => {
          let isDisabled = medicine.status === "disable" || false;
          let totalBoxes = medicine.retailStocks[0]?.stocks.reduce(
            (acc, stock) => acc + stock.quantity.boxes,
            0
          );
          let totalStrips = medicine.retailStocks[0]?.stocks.reduce(
            (acc, stock) => acc + stock.quantity.totalStrips,
            0
          );
          let totalExtra = medicine.retailStocks[0]?.stocks.reduce(
            (acc, stock) => acc + stock.quantity.extra,
            0
          );
          let totalTablets = medicine.retailStocks[0]?.stocks.reduce(
            (acc, stock) => acc + stock.quantity.tablets,
            0
          );
          let label0 = medicine.unitLabels?.level0
            ? `${medicine.unitLabels.level0}s`
            : "tablets";

          let label1 = medicine.unitLabels?.level1
            ? `${medicine.unitLabels.level1}s`
            : medicine.isTablets
            ? "strips"
            : "units";

          let label2 = medicine.unitLabels?.level2
            ? medicine.unitLabels.level2
            : "Boxes";

          let stockText = `Total ${label1}: ${totalStrips} = ${label2}: ${totalBoxes}, Extra: ${totalExtra}${
            totalTablets > 0 ? `, ${label0}: ${totalExtra}` : ""
          }`;

          return (
            <div key={index} className="w-full">
              <div
                onClick={() =>
                  setSelectedIndex(selectedIndex === index ? null : index)
                }
                className="w-full hover:cursor-pointer rounded-full font-medium bg-gray-300 hover:bg-gray-400 p-2 my-1 flex items-center"
              >
                <div className="w-[10%] px-1">{index + 1 + "."}</div>
                <div className="w-[45%] px-3 flex items-center gap-1">
                  <div>{medicine.name}</div>
                  {isDisabled && (
                    <div className="px-2 py-0.5 rounded bg-red-600 text-white text-xs">
                      Discontinued
                    </div>
                  )}
                </div>
                <div className="w-[40%] text-center">
                  {medicine.retailStocks.length > 0 ? stockText : "--"}
                </div>
                {medicine.retailStocks.length > 0 &&
                  totalStrips < medicine.maximumStockCount?.retails &&
                  totalStrips <= medicine.minimumStockCount?.retails &&
                  (totalStrips <= medicine.minimumStockCount?.retails / 2 ? (
                    <FaFire className="text-red-600 size-5 animate-pulse" />
                  ) : (
                    <TiWarning className="text-amber-600 size-6 animate-pulse" />
                  ))}
                {medicine.requests.length ? (
                  <div className="text-red-900 text-lg">
                    <ImBoxRemove />
                  </div>
                ) : (
                  <></>
                )}
              </div>
              {selectedIndex === index && (
                <div className="w-full bg-slate-200 p-2 rounded-xl flex flex-col justify-center items-center">
                  <div className="flex flex-wrap w-full gap-x-4 justify-around border-b-2 border-gray-400 py-2">
                    <div className="py-1 px-4 ">
                      Manufacturer:{" "}
                      <span className="text-blue-500 font-semibold">
                        {medicine.manufacturer?.name}
                      </span>
                    </div>
                    <div className="py-1 px-4 ">
                      Salts:{" "}
                      <span className="text-blue-500 font-semibold">
                        {medicine.salts[0]?.name}
                      </span>
                    </div>
                    <div className="py-1 px-4 ">
                      {`${label1}: `}
                      <span className="text-blue-500 font-semibold">
                        {medicine.packetSize?.strips}
                      </span>
                    </div>
                    {medicine.isTablets && (
                      <div className="py-1 px-4 ">
                        {`${label0} per ${label1}: `}
                        <span className="text-blue-500 font-semibold">
                          {medicine.packetSize?.tabletsPerStrip}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-around items-center mt-2 w-full">
                    {medicine.minimumStockCount &&
                    medicine.minimumStockCount?.retails != null ? (
                      <div className="flex justify-center items-center gap-2 ">
                        <div className="font-semibold text-gray-600 bg-slate-300 px-2 rounded">
                          Min Stock Qty:{" "}
                          <span className="text-black">
                            {medicine.minimumStockCount?.retails}
                          </span>
                        </div>
                        <div
                          className="text-red-700 bg-red-200 p-1 rounded-md hover:text-red-800 cursor-pointer"
                          onClick={() => {
                            setFilteredMedicines((prevMedicines) =>
                              prevMedicines.map((med) =>
                                med._id === medicine._id
                                  ? {
                                      ...med,
                                      minimumStockCount: {
                                        ...med.minimumStockCount,
                                        retails: null,
                                      },
                                    }
                                  : med
                              )
                            );
                          }}
                        >
                          <IoIosRemoveCircle className="size-4" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center gap-2">
                        <input
                          type="number"
                          value={minQty}
                          min={0}
                          onChange={(e) => {
                            setMinQty(e.target.value);
                          }}
                          placeholder="Set Min Stock Qty"
                          className="rounded-lg py-1 px-2 bg-slate-300 text-black outline-none"
                        />
                        <button
                          className="rounded-lg px-3 py-1 text-white font-semibold bg-slate-700 hover:bg-slate-600"
                          onClick={() => {
                            handleSetMinQty(medicine._id);
                          }}
                          disabled={submitting}
                        >
                          {submitting ? "Wait..." : "Set"}
                        </button>
                      </div>
                    )}
                    {medicine.maximumStockCount &&
                    medicine.maximumStockCount?.retails != null ? (
                      <div className="flex justify-center items-center gap-2 ">
                        <div className="font-semibold text-gray-600 bg-slate-300 px-2 rounded">
                          Max Stock Qty:{" "}
                          <span className="text-black">
                            {medicine.maximumStockCount?.retails}
                          </span>
                        </div>
                        <div
                          className="text-red-700 bg-red-200 p-1 rounded-md hover:text-red-800 cursor-pointer"
                          onClick={() => {
                            setFilteredMedicines((prevMedicines) =>
                              prevMedicines.map((med) =>
                                med._id === medicine._id
                                  ? {
                                      ...med,
                                      maximumStockCount: {
                                        ...med.maximumStockCount,
                                        retails: null,
                                      },
                                    }
                                  : med
                              )
                            );
                          }}
                        >
                          <IoIosRemoveCircle className="size-4" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center gap-2">
                        <input
                          type="number"
                          value={maxQty}
                          min={0}
                          onChange={(e) => {
                            setMaxQty(e.target.value);
                          }}
                          placeholder="Set Max Stock Qty"
                          className="rounded-lg py-1 px-2 bg-slate-300 text-black outline-none"
                        />
                        <button
                          className="rounded-lg px-3 py-1 text-white font-semibold bg-slate-700 hover:bg-slate-600"
                          onClick={() => {
                            handleSetMaxQty(medicine._id);
                          }}
                          disabled={submitting}
                        >
                          {submitting ? "Wait..." : "Set"}
                        </button>
                      </div>
                    )}
                    {medicine.requests.length == 0 && (
                      <button
                        className="px-3 py-2 font-semibold text-white my-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
                        onClick={() => {
                          setRequestedMedicine(medicine);
                        }}
                      >
                        Request
                      </button>
                    )}
                  </div>

                  {medicine.requests.map((request, it) => (
                    <div
                      key={it}
                      className="w-full rounded-full border-b-2 border-gray-300 p-2 flex justify-around items-center"
                    >
                      <div className="">
                        {"Requested Quantity: " +
                          request.requestedQuantity +
                          " Boxes"}
                      </div>
                      <div className="">
                        {"Requested Date: " +
                          format(
                            new Date(request?.createdAt),
                            "dd/MM/yy | hh:mm a"
                          )}
                      </div>
                      <div className="px-2 py-1 rounded-lg bg-yellow-400 text-yellow-800 text-sm font-semibold">
                        {request.status}
                      </div>
                      {request.status === "Approved" && (
                        <div className="flex justify-around items-center gap-2">
                          <button
                            className="px-3 py-1 font-semibold text-white my-2 bg-red-500 disabled:bg-gray-600 rounded-lg"
                            disabled={isReceiving}
                            onClick={() => {
                              handleResolveRequest(
                                "rejected",
                                request._id,
                                medicine._id
                              );
                            }}
                          >
                            {isReceiving ? "Processing..." : "Reject"}
                          </button>
                          <button
                            className="px-3 py-1 font-semibold text-white my-2 bg-violet-500 disabled:bg-gray-600 rounded-lg"
                            disabled={isReceiving}
                            onClick={() => {
                              handleResolveRequest(
                                "received",
                                request._id,
                                medicine._id
                              );
                            }}
                          >
                            {isReceiving
                              ? "Processing..."
                              : "Confirm Receiving"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="w-full py-1 max-h-48 overflow-y-auto">
                    {medicine.retailStocks[0]?.stocks?.map((stock, index1) => {
                      let batchStockText = `Total ${label1}: ${
                        stock.quantity.totalStrips
                      } = ${label2}: ${stock.quantity.boxes}, Extra: ${
                        stock.quantity.extra
                      }${
                        stock.quantity.tablets > 0
                          ? `, ${label0}: ${stock.quantity.tablets}`
                          : ""
                      }`;
                      return (
                        <div
                          key={index1}
                          className="w-full rounded-xl my-1 bg-gray-300 p-2"
                        >
                          <div className="flex flex-wrap gap-3 justify-around items-center">
                            <div className="">{stock.batchName}</div>
                            <div className="">
                              {"Expiry: " + stock.expiryDate.split("T")[0]}
                            </div>
                            <div className="">
                              {"MRP: " + stock.sellingPrice}
                            </div>
                            <div className="">{batchStockText}</div>
                            {/* <div className="w-[10%]">
                        {"P: " + stock.purchasePrice}
                      </div> */}
                          </div>
                          {stock.createdAt && (
                            <div className="text-sm text-center text-gray-500 font-semibold">
                              {"Stock Added on: " +
                                format(
                                  new Date(stock.createdAt),
                                  "dd/MM/yy | hh:mm a"
                                )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="w-full p-4 flex flex-col justify-center items-center text-2xl font-semibold text-gray-400">
          <BiInjection size={60} />
          <div>No Medicine</div>
        </div>
      )}
      {requestedMedicine && (
        <>
          <div className="absolute top-0 left-0">
            <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
              <div className="w-[95%] md:w-4/5 lg:w-3/4 py-4 text-center bg-slate-950 px-4 rounded-xl">
                <h2 className="font-bold text-xl text-blue-500">
                  New Stock Request
                </h2>
                <hr className="border border-slate-800 w-full my-2" />
                {message && (
                  <div className="my-1 text-center text-red-500">{message}</div>
                )}
                {responseMessage && (
                  <div className="my-1 text-center text-red-500">
                    {responseMessage}
                  </div>
                )}
                <div className="flex flex-wrap justify-around text-gray-50">
                  <div className="py-1 px-4 text-gray-50 ">
                    Medicine Name:{" "}
                    <span className="text-blue-500 font-semibold">
                      {requestedMedicine.name}
                    </span>
                  </div>
                  <div className="py-1 px-4 text-gray-50 ">
                    Salts:{" "}
                    <span className="text-blue-500 font-semibold capitalize">
                      {requestedMedicine.salts[0].name}
                    </span>
                  </div>
                </div>
                <div className="py-1 px-4 text-gray-50 ">
                  Box Size:{" "}
                  <span className="text-blue-500 font-semibold capitalize">
                    {requestedMedicine.packetSize.strips +
                      " Units, * " +
                      requestedMedicine.packetSize.tabletsPerStrip +
                      " Pcs"}
                  </span>
                </div>
                <hr className="border border-slate-800 w-full my-2" />
                <div className="block font-semibold text-gray-50">Quantity</div>
                <div className="flex justify-center items-center text-gray-800 py-1">
                  <input
                    type="number"
                    value={requestedQuantity}
                    onChange={(e) => {
                      setRequestedQuantity(e.target.value);
                    }}
                    className="p-2 rounded-xl w-full md:w-3/4 bg-gray-700 text-gray-300"
                    placeholder="Enter Box Quantity"
                  />
                </div>
                <div className="block font-semibold text-gray-50">
                  Current Quantity
                </div>
                <div className="flex justify-center items-center text-gray-800 py-1">
                  <input
                    type="number"
                    min={0}
                    value={enteredRemainingQuantity}
                    onChange={(e) => {
                      setEnteredRemainingQuantity(e.target.value);
                    }}
                    className="p-2 rounded-xl w-full md:w-3/4 bg-gray-700 text-gray-300"
                    placeholder="Current Box Quantity"
                  />
                </div>
                <hr className="border border-slate-800 w-full my-2" />
                <div className="flex px-4 gap-3 justify-end">
                  <div
                    className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
                    onClick={() => {
                      setRequestedMedicine(null);
                    }}
                  >
                    Cancel
                  </div>
                  <button
                    onClick={handleCreateRequest}
                    className="w-20 h-8 py-1 flex items-center justify-center gap-2 bg-green-500 rounded-lg font-semibold cursor-pointer text-white"
                    disabled={
                      !requestedQuantity ||
                      !enteredRemainingQuantity ||
                      submitting
                    }
                  >
                    {submitting ? <Loading size={15} /> : <></>}
                    {submitting ? "Wait..." : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RetailStock;
