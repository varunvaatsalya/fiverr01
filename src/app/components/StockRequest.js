"use client";
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { MdClearAll } from "react-icons/md";
import { format } from "date-fns";
import { FaCircleCheck } from "react-icons/fa6";
import { RxCrossCircled } from "react-icons/rx";
import { useStockType } from "../context/StockTypeContext";
import { CiCircleMinus } from "react-icons/ci";
import { IoMdAddCircleOutline } from "react-icons/io";
import { IoCloseCircleOutline } from "react-icons/io5";
import { FaAngleRight, FaArrowRight } from "react-icons/fa";
import { showError, showInfo } from "@/app/utils/toast";

function StockRequest({
  stockRequest,
  setStockRequests,
  approvedStockRequest,
  setApprovedStockRequests,
}) {
  const [isOpenProceedSection, setIsOpenProceedSection] = useState(false);
  const [isOpenApprovedSection, setIsOpenApprovedSection] = useState(false);
  const [activeIndex, setActiveIndex] = useState(false);
  const [printableDetails, SetPrintableDetails] = useState(null);
  const [selectedReqs, setSelectedReqs] = useState([]);
  const [stockPendingRequests, setStockPendingRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const stockList = useMemo(() => {
    return isOpenApprovedSection ? approvedStockRequest : stockRequest;
  }, [isOpenApprovedSection, approvedStockRequest, stockRequest]);

  const sectionType = useStockType();

  useEffect(() => {
    setStockPendingRequests(
      stockRequest.filter((request) => request.status === "Pending")
    );
  }, [stockRequest]);

  async function handlePrintStocks() {
    if (!printableDetails) return;
    let allAllocatedStocks = printableDetails.flatMap((req) =>
      req.allocatedStocks.map((batch) => ({
        Medicine_Name: req.medicine,
        Batch_Name: batch.batchName,
        Expiry_Date: format(new Date(batch.expiryDate), "MM/yy"),
        Total_Strips: batch.quantity.totalStrips,
        Boxes: batch.quantity.boxes,
        Extra_Strips: batch.quantity.extra,
      }))
    );

    if (allAllocatedStocks.length === 0) {
      showError("No allocated stocks found!");
      return;
    }

    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const totalQuantity = selectedReqs.length;

    const fileName = `${currentDate}_Req-${totalQuantity}.xlsx`;
    // Convert data to Excel
    const worksheet = XLSX.utils.json_to_sheet(allAllocatedStocks);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Allocated Stocks");

    // Download Excel file
    XLSX.writeFile(workbook, fileName);
  }

  async function handleGetDetails() {
    if (selectedReqs.length === 0) return;
    setFetchingDetails(true);
    try {
      let result = await fetch(`/api/stockRequest/resolveRequest`, {
        method: "POST",
        body: JSON.stringify({
          requests: selectedReqs.map((req) => ({
            requestId: req._id,
            enteredTransferQty: req.enteredTransferQty,
          })),
          sectionType,
        }),
      });
      result = await result.json();

      if (result.success) {
        SetPrintableDetails(result.stockResults);
        setSelectedReqs((prevReqs) =>
          prevReqs.map((req) => {
            const stock = result.stockResults.find(
              (s) => s.requestId === req._id
            );
            return stock
              ? {
                  ...req,
                  ...{
                    approvedQuantity: stock.allocatedStocks,
                    remainingStrips: stock.remainingStrips,
                  },
                } // merge stock data into matched req
              : req;
          })
        );
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setFetchingDetails(false);
    }
  }

  async function handleRemoveRequest(id) {
    if (!id) return;
    if (!window.confirm("Do you want to reject this invoice!")) {
      return;
    }
    setRejecting(true);
    try {
      let result = await fetch(
        `/api/stockRequest/resolveRequest?status=rejected`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId: id,
            sectionType,
          }),
        }
      );
      result = await result.json();
      showInfo(result.message);
      const filteredRequests = stockRequest.filter((obj) => obj._id !== id);
      setStockRequests(filteredRequests);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setRejecting(false);
    }
  }

  async function handleResolveRequest(id) {
    setSubmitting(true);
    let request = selectedReqs.find((req) => req._id === id);
    try {
      // Make a POST request to the API with the request ID
      const response = await fetch(`/api/stockRequest/resolveRequest`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: request._id,
          enteredTransferQty: request.enteredTransferQty,
          sectionType,
        }),
      });

      // Parse the JSON response
      const result = await response.json();

      showInfo(result.message);
      if (result.success) {
        setStockRequests((prev) =>
          prev.filter((stockrequest) => stockrequest._id !== result.request._id)
        );
        setApprovedStockRequests((prev) => [result.request, prev]);
        setSelectedReqs((prev) => prev.filter((r) => r._id != id));
      }
    } catch (error) {
      console.error("Error resolving the request:", error);
      showError("An error occurred while resolving the request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-2 lg:px-4 max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center gap-2 mb-2">
        <div className="flex gap-2 items-center">
          <button
            disabled={approvedStockRequest.length === 0}
            onClick={() => {
              setIsOpenApprovedSection(true);
            }}
            className={
              "px-3 py-2 text-gray-900 border border-gray-800 rounded-lg font-semibold " +
              (isOpenApprovedSection
                ? "bg-gray-900 text-white"
                : "text-gray-900")
            }
          >
            {`Approved ${
              approvedStockRequest.length > 0
                ? `(${approvedStockRequest.length})`
                : ""
            }`}
          </button>
          {isOpenApprovedSection && (
            <div
              onClick={() => {
                setIsOpenApprovedSection(false);
              }}
              className="p-2 hover:bg-gray-300 rounded-lg cursor-pointer"
            >
              <IoCloseCircleOutline className="size-5 text-red-500" />
            </div>
          )}
        </div>
        {!isOpenApprovedSection && (
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 border border-gray-800 hover:bg-gray-200 rounded-full flex justify-center items-center gap-2"
              disabled={
                stockPendingRequests.length === 0 ||
                selectedReqs.length === stockPendingRequests.length
              }
              onClick={() => {
                setSelectedReqs(stockPendingRequests.map((request) => request));
              }}
            >
              <div className="flex justify-center items-center outline outline-1 outline-offset-1 outline-gray-800 w-5 h-5 rounded-full">
                {stockPendingRequests.length > 0 &&
                  stockPendingRequests.length === selectedReqs.length && (
                    <FaCircleCheck className="text-gray-800" />
                  )}
              </div>
              <div className="font-semibold text-gray-800">Select All</div>
            </button>
            {selectedReqs.length > 0 && (
              <button
                onClick={() => {
                  setSelectedReqs([]);
                }}
                className="px-3 py-2 text-gray-800 border border-gray-800 rounded-full flex justify-center items-center gap-2"
              >
                <RxCrossCircled className="size-6" />
                <div className="font-semibold">Clear</div>
              </button>
            )}
            <button
              disabled={selectedReqs.length === 0}
              onClick={() => {
                setIsOpenProceedSection(true);
              }}
              className="px-3 py-2 bg-gray-900 text-white disabled:bg-gray-300 disabled:text-gray-400 rounded-xl font-semibold flex gap-1 items-center"
            >
              <div>Proceed</div>
              <FaArrowRight className="size-4" />
            </button>
          </div>
        )}
      </div>
      <div className="h-12 px-3 flex rounded-full bg-black text-white">
        <div className="w-[10%] px-2 flex items-center justify-center">
          Sr No.
        </div>
        <div className="w-full px-2 flex items-center ">Medicine</div>
        <div className="w-[25%] px-2 flex items-center">Req/App at</div>
        <div className="w-[25%] px-2 flex items-center">Req/App Qty</div>
        <div className="w-[20%] px-2 flex items-center">Status</div>
      </div>

      {stockList.length > 0 ? (
        stockList.map((request, index) => {
          let qty = isOpenApprovedSection
            ? request?.approvedQuantity?.reduce(
                (sum, batch) => sum + (batch.quantity?.totalStrips ?? 0),
                0
              )
            : request.requestedQuantity;
          return (
            <div key={index}>
              <div className="h-12 text-sm flex items-center text-black border-b-2 border-gray-300 px-3">
                <div className="w-[10%] flex items-center justify-center gap-1">
                  {!isOpenApprovedSection && (
                    <div
                      onClick={() =>
                        setActiveIndex(activeIndex === index ? null : index)
                      }
                      className="p-1 hover:bg-gray-300 rounded-lg cursor-pointer"
                    >
                      <FaAngleRight
                        className={
                          "size-4 text-gray-700 " +
                          (activeIndex === index ? "rotate-90" : "")
                        }
                      />
                    </div>
                  )}
                  <div>{index + 1}</div>
                </div>
                <div className="w-full px-2 flex items-center">
                  {request.medicine.name}
                </div>
                <div className="w-[25%] px-2 flex items-center max-md:hidden">
                  {format(
                    new Date(
                      isOpenApprovedSection
                        ? request.approvedAt
                        : request.createdAt
                    ),
                    "dd/MM/yy | hh:mm a"
                  )}
                </div>
                <div className="w-[25%] px-2 flex items-center max-md:hidden">
                  {qty + " Strips"}
                </div>
                <div className="w-[20%] font-bold text-sm px-2 flex items-center">
                  <span
                    className={
                      "px-2 py-1 rounded-lg " +
                      (request.status === "Pending"
                        ? "bg-yellow-300 text-yellow-800"
                        : "bg-red-300 text-red-800")
                    }
                  >
                    {request.status}
                  </span>
                </div>
                {!isOpenApprovedSection && (
                  <div
                    onClick={() => {
                      if (
                        selectedReqs.some((reqs) => reqs._id === request._id)
                      ) {
                        setSelectedReqs((reqs) =>
                          reqs.filter((req) => req._id !== request._id)
                        );
                      } else setSelectedReqs((prev) => [...prev, request]);
                    }}
                    className="p-2 hover:bg-gray-300 rounded-lg cursor-pointer"
                  >
                    {selectedReqs.some((reqs) => reqs._id === request._id) ? (
                      <CiCircleMinus className="size-5 text-red-500" />
                    ) : (
                      <IoMdAddCircleOutline className="size-5 text-green-500" />
                    )}
                  </div>
                )}
              </div>
              {activeIndex === index && (
                <div className="rounded-b-lg bg-gray-300 p-3">
                  <button
                    onClick={() => {
                      handleRemoveRequest(request._id);
                    }}
                    disabled={request.status !== "Pending" || rejecting}
                    className="px-2 py-1 text-sm rounded-md font-semibold bg-red-700"
                  >
                    {rejecting ? "Processing..." : "Reject"}
                  </button>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-gray-400 font-semibold text-lg flex flex-col justify-center items-center">
          <MdClearAll className="size-16" />
          <div>No Medicine Requests</div>
        </div>
      )}
      {isOpenProceedSection && (
        <div className="absolute top-0 left-0">
          <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
            <div className="w-[95%] md:w-3/4 p-3 text-center bg-slate-950 rounded-xl">
              <h2 className="font-semibold text-xl text-blue-500">
                Stock Transfer Details
              </h2>
              <div className="max-h-[60vh] overflow-y-auto p-2 my-2 border-y border-gray-500 space-y-2">
                {selectedReqs.length ? (
                  selectedReqs.map((req) => (
                    <div
                      key={req._id}
                      className="border rounded-lg border-gray-600 text-sm p-2"
                    >
                      <div className="grid grid-cols-5 items-center w-full py-1 border-b border-gray-500">
                        <div>{req.medicine.name}</div>
                        <div>
                          {`Req At: ${format(
                            new Date(req.createdAt),
                            "dd/MM/yy | HH:mm"
                          )}`}
                        </div>
                        <div>{`Actual Req: ${req.requestedQuantity}`}</div>
                        <input
                          type="number"
                          step={1}
                          min={1}
                          value={req.enteredTransferQty || ""}
                          onChange={(e) => {
                            setSelectedReqs((prev) =>
                              prev.map((Req) =>
                                Req._id === req._id
                                  ? {
                                      ...Req,
                                      enteredTransferQty: parseFloat(
                                        e.target.value
                                      ),
                                    }
                                  : Req
                              )
                            );
                            SetPrintableDetails(null);
                          }}
                          placeholder="Strips"
                          className="px-2 py-1 bg-gray-700 rounded-lg w-32"
                        />
                        <div className="flex items-center gap-1">
                          <div>
                            <button
                              disabled={
                                req.approvedQuantity.length === 0 || submitting
                              }
                              onClick={() => handleResolveRequest(req._id)}
                              className="text-sm font-semibold text-white bg-green-700 disabled:bg-gray-600 py-0.5 px-1.5 my-1 ml-auto rounded-lg"
                            >
                              {submitting ? "Wait..." : "Approve & Transfer"}
                            </button>
                          </div>
                          <div
                            onClick={() => {
                              setSelectedReqs((prev) =>
                                prev.filter((r) => r._id != req._id)
                              );
                            }}
                            className="p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
                          >
                            <CiCircleMinus className="size-5 text-red-500" />
                          </div>
                        </div>
                      </div>
                      {req.approvedQuantity &&
                        req.approvedQuantity.length > 0 && (
                          <div className="px-2">
                            <div className="grid grid-cols-5 items-center gap-2 bg-gray-800 rounded-lg py-0.5">
                              <div>Batch</div>
                              <div>Expiry</div>
                              <div>Packet</div>
                              <div>Avl</div>
                              <div>Allocated</div>
                            </div>
                            {req.approvedQuantity.map((batch, it) => (
                              <div
                                key={batch.batchName + it}
                                className="grid grid-cols-5 items-center gap-2 py-0.5"
                              >
                                <div>{batch.batchName}</div>
                                <div>
                                  {format(new Date(batch.expiryDate), "MM/yy")}
                                </div>
                                <div>
                                  {`${batch.packetSize.strips} Pack, ${batch.packetSize.tabletsPerStrip} U`}
                                </div>
                                <div>
                                  {batch.available ? (
                                    <>
                                      <span className="text-blue-500 font-semibold">
                                        {batch.available.totalStrips}
                                      </span>
                                      {`=${batch.available.boxes}B+${batch.available.extra}P`}
                                    </>
                                  ) : (
                                    "--"
                                  )}
                                </div>
                                <div>
                                  <span className="text-blue-500 font-semibold">
                                    {batch.quantity.totalStrips}
                                  </span>
                                  {`=${batch.quantity.boxes}B+${batch.quantity.extra}P`}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">
                    No Selected Requests
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-2">
                  {printableDetails && (
                    <button
                      className="border border-white rounded-md text-white px-2 py-0.5"
                      onClick={handlePrintStocks}
                    >
                      Print
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="border border-gray-600 rounded-md text-white px-2 py-0.5"
                    onClick={() => {
                      setIsOpenProceedSection(false);
                      SetPrintableDetails(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleGetDetails}
                    disabled={selectedReqs.length === 0 || fetchingDetails}
                    className="px-2 py-1 text-sm rounded-md font-semibold bg-blue-700 disabled:bg-gray-500"
                  >
                    {fetchingDetails ? "Fetching..." : "Get Details"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* {isOpenDetailsSection && (
        <div className="absolute top-0 left-0">
          <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
            <div className="w-[95%] md:w-4/5 lg:w-3/4 py-4 text-center bg-slate-950 px-4 rounded-xl">
              <h2 className="font-bold text-2xl text-blue-500">
                Stock Details
              </h2>
              <hr className="border border-slate-800 w-full my-2" />
              {message && (
                <div className="my-1 text-center text-red-500">{message}</div>
              )}
              {stockDetails && (
                <>
                  <div className="flex flex-wrap justify-around gap-2 text-white w-full">
                    <div className="">
                      Medicine Name:{" "}
                      <span className="text-blue-500 font-semibold">
                        {stockDetails.request.medicine.name}
                      </span>
                    </div>
                    <div className="">
                      Salts:{" "}
                      <span className="text-blue-500 font-semibold capitalize">
                        {stockDetails.request.medicine.salts.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-around gap-2 text-white w-full">
                    <div className="">
                      Box Size:{" "}
                      <span className="text-blue-500 font-semibold capitalize">
                        {stockDetails.request.medicine.packetSize.strips +
                          " Units, * " +
                          stockDetails.request.medicine.packetSize
                            .tabletsPerStrip +
                          " Pcs"}
                      </span>
                    </div>
                    <div className="">
                      Status:{" "}
                      <span
                        className={
                          "font-semibold capitalize " +
                          (stockDetails.status === "Fullfilled"
                            ? "text-green-500"
                            : "text-yellow-500")
                        }
                      >
                        {stockDetails.status}
                      </span>
                    </div>
                  </div>
                  <hr className="border border-slate-800 w-full my-2" />
                  <div className="w-full md:w-4/5 px-2 mx-auto my-2 max-h-[60vh] text-white overflow-auto space-y-2">
                    {stockDetails.allocatedStocks.map((stocks, index) => {
                      return (
                        <div
                          className="p-3 rounded-lg border-2 border-gray-800"
                          key={index}
                        >
                          <div className="flex flex-wrap justify-around border-b-2 border-gray-800">
                            <div className="py-1 px-4 ">
                              Batch :{" "}
                              <span className="text-blue-500 font-semibold capitalize">
                                {stocks.batchName}
                              </span>
                            </div>
                            <div className="py-1 px-4 ">
                              Expiry Date:{" "}
                              <span className="text-blue-500 font-semibold uppercase">
                                {formatDateTimeToIST(stocks.expiryDate)}
                              </span>
                            </div>
                          </div>
                          <div className="border-b-2 w-4/5 mx-auto border-gray-800 flex">
                            <div className="w-1/2 p-2">Total Strips</div>
                            <div className="w-1/2 p-2">
                              {stocks.allocatedQuantity.totalStrips}
                            </div>
                          </div>
                          <div className="border-b-2 w-4/5 mx-auto border-gray-800 flex">
                            <div className="w-1/2 p-2">Strips</div>
                            <div className="w-1/2 p-2 text-green-500">
                              {stocks.allocatedQuantity.boxes}
                            </div>
                          </div>
                          <div className="border-b-2 w-4/5 mx-auto border-gray-800 flex">
                            <div className="w-1/2 p-2">Extra Strips</div>
                            <div className="w-1/2 p-2">
                              {stocks.allocatedQuantity.extraStrips}
                            </div>
                          </div>
                          <div className="text-gray-500 text-sm">
                            Stock Created at{" "}
                            {formatDateTimeToIST(stocks.createdAt)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              <hr className="border border-slate-800 w-full my-2" />
              <div className="flex px-4 gap-3 justify-end">
                <div
                  className="px-3 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
                  onClick={() => {
                    setstockDetails(null);
                    setIsOpenDetailsSection(false);
                    setMessage("");
                  }}
                >
                  Cancel
                </div>
                <button
                  onClick={handleResolveRequest}
                  className="px-3 py-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-800 rounded-lg font-semibold cursor-pointer text-white"
                  disabled={submitting}
                >
                  {submitting ? <Loading size={15} /> : <></>}
                  {submitting ? "Wait..." : "Confirm Aprroval & Transfer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}

export default StockRequest;

// {request.status === "Pending" && (
//                     <div className="flex justify-center items-center gap-2 my-2">
//                       <button
//                         onClick={() => {
//                           handleRemoveRequest(request._id);
//                         }}
//                         className="py-2 px-4 text-white bg-red-700 hover:bg-red-800 rounded-lg font-semibold flex gap-1 items-center"
//                       >
//                         Reject
//                       </button>
//                       <button
//                         onClick={() => {
//                           if (selectedReqs.some((id) => id === request._id)) {
//                             setSelectedReqs((ids) =>
//                               ids.filter((id) => id !== request._id)
//                             );
//                           } else setSelectedReqs((ids) => [...ids, request._id]);
//                         }}
//                         className="py-2 px-4 text-red-700 border border-red-700 hover:text-red-800 rounded-lg font-semibold flex gap-1 items-center"
//                       >
//                         {selectedReqs.some((id) => id === request._id)
//                           ? "Remove"
//                           : "Select"}
//                       </button>
//                       <button
//                         onClick={() => {
//                           handleViewDetails(request._id);
//                         }}
//                         disabled={isOpenDetailsSection}
//                         className="py-2 px-4 text-white bg-sky-600 hover:bg-sky-700 rounded-lg font-semibold flex gap-1 items-center"
//                       >
//                         Approved & Transfer Details
//                       </button>
//                     </div>
//                   )}
