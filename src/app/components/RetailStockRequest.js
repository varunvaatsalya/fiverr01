"use client";
import React, { useEffect, useState } from "react";
import { BiInjection, BiLoaderCircle } from "react-icons/bi";
import Loading from "./Loading";
import { useStockType } from "../context/StockTypeContext";
import { formatDateTimeToIST } from "../utils/date";
import { showError, showInfo, showSuccess } from "../utils/toast";

function RetailStockRequest({
  filteredMedicines = [],
  searchedMedicines,
  setMedicineStock,
  filterType,
  finding,
}) {
  const [proceedSection, setProceedSection] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState([]);
  const [responseResult, setResponseResult] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);

  const sectionType = useStockType();

  useEffect(() => {
    setSelectedMedicine([]);
  }, [filteredMedicines]);

  async function handleCreateRequest() {
    setSubmitting(true);
    try {
      console.log(selectedMedicine);
      let result = await fetch("/api/stockRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify({
          requests: selectedMedicine.map((med) => ({
            medicine: med._id,
            medicineName: med.name,
            requestedQuantity: med.requestedQuantity,
            enteredRemainingQuantity: med.enteredRemainingQuantity,
          })),
          sectionType,
        }),
      });

      result = await result.json();
      showInfo(result.message);
      console.log(result);
      if (result.success) {
        setResponseResult(result.responses);
        result.responses.forEach((response) => {
          if (response.success) {
            setMedicineStock((prevStock) =>
              prevStock.map((medicine) =>
                medicine._id === response.newMedicineStockRequest.medicine
                  ? {
                      ...medicine,
                      requests: [
                        ...medicine.requests,
                        response.newMedicineStockRequest,
                      ],
                    }
                  : medicine
              )
            );
          }
        });

        setTimeout(() => {
          setSelectedMedicine([]);
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResolveRequest(status, id, medId) {
    if (status === "rejected") {
      if (!window.confirm("Do you want to reject this medicine!")) return;
    }
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

      if (result.success) {
        showSuccess(result.message);
        setMedicineStock((prev) => prev.filter((obj) => obj._id !== medId));
      }
    } catch (error) {
      console.error("Error resolving the request:", error);
      showError("An error occurred while resolving the request.");
    } finally {
      setIsReceiving(false);
    }
  }

  const handleQuantityChange = (medicineId, value) => {
    setSelectedMedicine((prevSelected) =>
      prevSelected.map((medicine) =>
        medicine._id === medicineId
          ? { ...medicine, requestedQuantity: value }
          : medicine
      )
    );
  };

  const handleRemainingQuantityChange = (medicineId, value) => {
    setSelectedMedicine((prevSelected) =>
      prevSelected.map((medicine) =>
        medicine._id === medicineId
          ? { ...medicine, enteredRemainingQuantity: value }
          : medicine
      )
    );
  };

  return (
    <div className="p-2 w-full md:w-4/5 lg:w-3/4 mx-auto text-gray-900">
      <div className="flex gap-2 items-center font-semibold text-gray-100">
        <div className="w-full rounded-full p-2 bg-gray-900 text-center ">
          List of all out of stock Medcines
        </div>
        {filterType === "outofstock" && (
          <>
            <button
              disabled={selectedMedicine.length === filteredMedicines?.length}
              className="rounded-full px-3 bg-gray-900 py-2 text-nowrap"
              onClick={() => {
                const allSelected = filteredMedicines
                  ?.filter((medicine) => {
                    return !medicine.requests || medicine.requests.length === 0;
                  })
                  .map((medicine) => {
                    const min = medicine.minimumStockCount?.retails;
                    const max = medicine.maximumStockCount?.retails;
                    const current = medicine.totalRetailStock;

                    const shouldCalculate =
                      min !== undefined &&
                      max !== undefined &&
                      max >= min &&
                      min >= current &&
                      max > current;

                    return {
                      ...medicine,
                      enteredRemainingQuantity: "",
                      requestedQuantity: shouldCalculate ? max - current : "",
                    };
                  });

                setSelectedMedicine(allSelected);
              }}
            >
              Select All
            </button>
            <button
              onClick={() => {
                setSelectedMedicine([]);
              }}
              disabled={!selectedMedicine.length}
              className="rounded-full px-3 bg-gray-900 py-2 text-nowrap"
            >
              Clear All
            </button>
          </>
        )}
        <button
          onClick={() => setProceedSection(true)}
          disabled={!selectedMedicine.length}
          className="rounded-full px-3 bg-gray-900 py-2"
        >
          Proceed
        </button>
      </div>
      {/* {searchedMedicines.length > 0 ? (
        searchedMedicines.map((medicine, index) => {
          const isSelected = selectedMedicine.some(
            (item) => item._id === medicine._id
          );
          return (
            <div key={index}>
              <div
                onClick={() =>
                  setSelectedIndex(selectedIndex === index ? null : index)
                }
                className="w-full hover:cursor-pointer rounded-full font-medium bg-gray-300 hover:bg-gray-400 p-2 my-1 flex items-center"
              >
                <div className="w-1/5 text-center px-3">{index + 1}</div>
                <div className="w-2/5 text-center px-3">{medicine.name}</div>
                <div className="w-2/5 flex justify-end items-center gap-2 px-4 font-semibold">
                  {isSelected && (
                    <FaCheckCircle className="size-5 text-green-400" />
                  )}
                  <div>
                    {medicine.requests.length > 0
                      ? medicine.requests[0].status
                      : "Not Requested"}
                  </div>
                </div>
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
                      Strips:{" "}
                      <span className="text-blue-500 font-semibold">
                        {medicine.packetSize?.strips}
                      </span>
                    </div>
                    {medicine.isTablets && (
                      <div className="py-1 px-4 ">
                        Tablets per strip:{" "}
                        <span className="text-blue-500 font-semibold">
                          {medicine.packetSize?.tabletsPerStrip}
                        </span>
                      </div>
                    )}
                  </div>

                  {medicine.requests.length > 0 ? (
                    medicine.requests.map((request) => (
                      <div
                        key={request._id}
                        className="w-full flex flex-col items-center"
                      >
                        <div className="w-full rounded-full border-b-2 border-gray-300 p-2 flex justify-around items-center">
                          <div className="">
                            {"Entered current Quantity: " +
                              request.enteredRemainingQuantity +
                              " Boxes"}
                          </div>
                          <div className="">
                            {"Requested Date: " +
                              request.createdAt.split("T")[0]}
                          </div>
                          <div
                            className={
                              "px-2 py-1 rounded-lg text-sm font-semibold " +
                              (request.status === "Pending"
                                ? "bg-yellow-300 text-yellow-800"
                                : "bg-red-300 text-red-800")
                            }
                          >
                            {request.status}
                          </div>
                        </div>
                        {request.status === "Approved" && (
                          <div className="w-full flex justify-around items-center gap-3">
                            <button
                              className="px-3 py-2 font-semibold text-white my-2 bg-red-500 disabled:bg-gray-600 rounded-lg"
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
                              className="px-6 py-2 font-semibold text-white my-2 bg-violet-500 disabled:bg-gray-600 rounded-lg"
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
                        {message && (
                          <div className="my-1 text-center text-red-500">
                            {message}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <button
                      className={
                        "px-3 py-2 font-semibold text-white my-2 rounded-lg " +
                        (!isSelected
                          ? "bg-teal-500 hover:bg-teal-600"
                          : "bg-red-500 hover:bg-red-600")
                      }
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMedicine(
                            selectedMedicine.filter(
                              (item) => item._id !== medicine._id
                            )
                          );
                        } else {
                          const min = medicine.minimumStockCount?.retails;
                          const max = medicine.maximumStockCount?.retails;
                          const current = medicine.totalRetailStock;

                          const shouldCalculate =
                            min !== undefined &&
                            max !== undefined &&
                            max >= min &&
                            min >= current &&
                            max > current;

                          setSelectedMedicine((prev) => [
                            ...prev,
                            {
                              ...medicine,
                              enteredRemainingQuantity: "",
                              requestedQuantity: shouldCalculate
                                ? max - current
                                : "",
                            },
                          ]);
                        }
                      }}
                    >
                      {isSelected ? "Remove" : "Select"}
                    </button>
                  )}
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
      )} */}
      <div className="my-2">
        {finding ? (
          <div className="w-full p-4 flex flex-col justify-center items-center text-2xl font-semibold text-gray-400">
            <BiLoaderCircle className="size-12 animate-spin" />
            <div>Finding...</div>
          </div>
        ) : searchedMedicines.length > 0 ? (
          searchedMedicines.map((medicine, index) => {
            const isSelected = selectedMedicine.some(
              (item) => item._id === medicine._id
            );

            const hasRequest =
              medicine.requests && medicine.requests.length > 0;
            const latestRequest = hasRequest ? medicine.requests[0] : null;

            const min = medicine.minimumStockCount?.retails;
            const max = medicine.maximumStockCount?.retails;
            const current = medicine.totalRetailStock;

            const shouldCalculate =
              typeof min === "number" &&
              typeof max === "number" &&
              max >= min &&
              min >= current &&
              max > current;

            // Combined packet info
            const packetInfo = medicine.isTablets
              ? `${medicine.packetSize?.strips || 0}x${
                  medicine.packetSize?.tabletsPerStrip || 0
                }`
              : `${medicine.packetSize?.strips || 0} strips`;

            return (
              <div
                key={medicine._id}
                className="w-full bg-gray-50 border rounded-md shadow-sm mb-2"
              >
                {/* Top Row */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-center p-3 text-sm font-medium text-gray-800">
                  <div>{index + 1}</div>
                  <div className="truncate">{medicine.name}</div>
                  <div className="truncate">{medicine.manufacturer}</div>
                  <div className="truncate">{medicine.salts}</div>
                  <div>{packetInfo}</div>

                  {/* Select/Unselect Button (only if no request) */}
                  {!hasRequest ? (
                    <button
                      className={`ml-auto px-3 py-1 rounded-full font-semibold text-white ${
                        isSelected
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gray-400 hover:bg-gray-500"
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMedicine((prev) =>
                            prev.filter((item) => item._id !== medicine._id)
                          );
                        } else {
                          setSelectedMedicine((prev) => [
                            ...prev,
                            {
                              ...medicine,
                              enteredRemainingQuantity: "",
                              requestedQuantity: shouldCalculate
                                ? max - current
                                : "",
                            },
                          ]);
                        }
                      }}
                    >
                      {isSelected ? "✓ Selected" : "Select"}
                    </button>
                  ) : (
                    <div className="text-center text-xs sm:text-sm text-gray-600 italic">
                      Requested
                    </div>
                  )}
                </div>

                {/* Second Row: Request Info */}
                {hasRequest && (
                  <div className="bg-white border-t px-4 py-2 text-sm text-gray-700">
                    {latestRequest.status === "Pending" ? (
                      <div className="text-yellow-700 bg-yellow-100 rounded-md px-3 py-1 inline-block">
                        Pending request on{" "}
                        <span className="font-semibold uppercase">
                          {formatDateTimeToIST(latestRequest.createdAt)}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between gap-2 pb-2">
                          <div className="text-green-700 font-semibold">
                            Approved on{" "}
                            <span className="font-semibold uppercase">
                              {formatDateTimeToIST(latestRequest.createdAt)}
                            </span>
                          </div>
                          {latestRequest.status === "Approved" && (
                            <div className="flex-1 flex items-center justify-between gap-3 px-3">
                              <button
                                className="px-3 py-1 font-semibold text-white bg-red-500 disabled:bg-gray-600 rounded-lg"
                                disabled={isReceiving}
                                onDoubleClick={() => {
                                  handleResolveRequest(
                                    "rejected",
                                    latestRequest?._id,
                                    medicine._id
                                  );
                                }}
                              >
                                {isReceiving ? "Processing..." : "Reject"}
                              </button>
                              <button
                                className="px-6 py-1 font-semibold text-white bg-violet-500 disabled:bg-gray-600 rounded-lg"
                                disabled={isReceiving}
                                onClick={() => {
                                  handleResolveRequest(
                                    "received",
                                    latestRequest?._id,
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
                        {latestRequest.allocatedStocks?.map((stock) => (
                          <div
                            key={stock._id}
                            className="flex justify-between items-center border-t py-1 text-gray-800"
                          >
                            <div>
                              Batch:{" "}
                              <span className="font-medium">
                                {stock.batchName}
                              </span>
                            </div>
                            <div>
                              Qty:{" "}
                              <span className="font-medium">
                                {stock.quantity?.boxes || 0} Boxes
                              </span>
                            </div>
                            <div>
                              Expiry:{" "}
                              <span className="font-medium">
                                {stock.expiryDate.split("T")[0]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
      </div>

      {proceedSection && (
        <>
          <div className="absolute top-0 left-0">
            <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
              <div className="w-[95%] md:w-4/5 lg:w-3/4 py-4 text-center bg-slate-950 px-4 rounded-xl">
                <h2 className="font-bold text-xl text-blue-500">
                  New Stock Request
                </h2>
                <hr className="border border-slate-800 w-full my-2" />

                <div className="flex flex-col items-center gap-1 max-h-[60vh] overflow-y-auto">
                  {responseResult.length > 0
                    ? responseResult.map((response, index) => (
                        <p
                          key={index}
                          className={`px-3 rounded-md ${
                            response.success ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {index + 1}. {response.medicineName} -{" "}
                          {response.message}
                        </p>
                      ))
                    : selectedMedicine.map((requestedMedicine, index) => (
                        <div
                          key={index + requestedMedicine.name}
                          className="w-full lg:w-3/4 bg-gray-800 rounded-xl font-semibold p-1"
                        >
                          <div className="px-4 text-gray-50 text-start">
                            Medicine Name:{" "}
                            <span className="text-blue-500 font-semibold">
                              {requestedMedicine.name}
                            </span>
                          </div>
                          <div className="flex justify-around items-center gap-2 px-4">
                            <div className="text-gray-50 ">
                              Box Size:{" "}
                              <span className="text-blue-500 font-semibold capitalize">
                                {requestedMedicine.packetSize.strips +
                                  " Units, * " +
                                  requestedMedicine.packetSize.tabletsPerStrip +
                                  " Pcs"}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min={0}
                                hidden={Boolean(
                                  requestedMedicine.requestedQuantity
                                )}
                                value={requestedMedicine.requestedQuantity}
                                onChange={(e) => {
                                  handleQuantityChange(
                                    requestedMedicine._id,
                                    e.target.value
                                  );
                                }}
                                className="px-2 py-1 text-sm rounded-lg focus:outline-gray-700 w-48 bg-gray-700 text-gray-300"
                                placeholder="Enter Box Quantity"
                              />
                              <input
                                type="number"
                                min={0}
                                value={
                                  requestedMedicine.enteredRemainingQuantity
                                }
                                onChange={(e) => {
                                  handleRemainingQuantityChange(
                                    requestedMedicine._id,
                                    e.target.value
                                  );
                                }}
                                className="px-2 py-1 text-sm rounded-lg focus:outline-gray-700 w-48 bg-gray-700 text-gray-300"
                                placeholder="Current Box Quantity"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
                <hr className="border border-slate-800 w-full my-2" />
                <div className="flex px-4 gap-3 justify-end">
                  <div
                    className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
                    onClick={() => {
                      setResponseResult([]);
                      setProceedSection(false);
                    }}
                  >
                    Cancel
                  </div>
                  {responseResult.length === 0 && (
                    <>
                      <button
                        onClick={handleCreateRequest}
                        className="w-20 h-8 py-1 flex items-center justify-center gap-2 bg-green-600 disabled:bg-gray-600 rounded-lg font-semibold text-white"
                        disabled={
                          selectedMedicine.some(
                            (medicine) =>
                              medicine.enteredRemainingQuantity === "" ||
                              medicine.requestedQuantity === ""
                          ) || submitting
                        }
                      >
                        {submitting ? <Loading size={15} /> : <></>}
                        {submitting ? "Wait..." : "Confirm"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RetailStockRequest;
