"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { MdClearAll } from "react-icons/md";
import { formatDateTimeToIST } from "../utils/date";
import Loading from "./Loading";
import { FaCircleCheck } from "react-icons/fa6";
import { RxCrossCircled } from "react-icons/rx";

function StockRequest({ stockRequest, setStockRequests }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isOpenDetailsSection, setIsOpenDetailsSection] = useState(false);
  const [stockDetails, setstockDetails] = useState(null);
  const [message, setMessage] = useState("");
  const [sheetMessage, setSheetMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [waiting, setWaiting] = useState(false);

  async function downloadAllocatedStocks() {
    setWaiting(true);
    let allAllocatedStocks = [];

    for (const id of selectedIds) {
      try {
        let result = await fetch(`/api/stockRequest?id=${id}`);
        result = await result.json();

        if (result.success) {
          const { allocatedStocks, request } = result;

          allocatedStocks.forEach((stock) => {
            allAllocatedStocks.push({
              Medicine_Name: request.medicine.name,
              Salt: request.medicine.salts.name,
              Batch_Name: stock.batchName,
              Expiry_Date: new Date(stock.expiryDate).toLocaleDateString(),
              Total_Strips: stock.allocatedQuantity.totalStrips,
              Boxes: stock.allocatedQuantity.boxes,
              Extra_Strips: stock.allocatedQuantity.extraStrips,
            });
          });
        }
      } catch (error) {
        console.error(`Error fetching stock for ID ${id}:`, error);
        setSheetMessage("Error in creating the sheet");
        setTimeout(() => {
          setSheetMessage("");
        }, 2500);
      }
      setWaiting(false);
    }

    if (allAllocatedStocks.length === 0) {
      alert("No allocated stocks found!");
      return;
    }

    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const totalQuantity = selectedIds.length;

    const fileName = `${currentDate}_Req-${totalQuantity}.xlsx`;
    // Convert data to Excel
    const worksheet = XLSX.utils.json_to_sheet(allAllocatedStocks);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Allocated Stocks");

    // Download Excel file
    XLSX.writeFile(workbook, fileName);
  }

  async function handleViewDetails(id) {
    setIsOpenDetailsSection(true);
    try {
      let result = await fetch(`/api/stockRequest?id=${id}`);
      result = await result.json();

      if (result.success) {
        setstockDetails({
          allocatedStocks: result.allocatedStocks,
          request: result.request,
          status: result.status,
        });
        console.log(JSON.stringify(result));
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    }
  }

  async function handleRemoveRequest(id) {
    try {
      let result = await fetch(`/api/stockRequest?id=${id}`, {
        method: "DELETE",
      });
      result = await result.json();
      setMessage(result.message);
      const filteredRequests = stockRequest.filter((obj) => obj._id !== id);
      setStockRequests(filteredRequests);
      setTimeout(() => {
        setstockDetails(null);
        setIsOpenDetailsSection(false);
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error submitting application:", error);
    }
  }

  async function handleResolveRequest() {
    setSubmitting(true);
    try {
      // Make a POST request to the API with the request ID
      const response = await fetch(`/api/stockRequest/resolveRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId: stockDetails.request._id }), // Send requestId in the body
      });

      // Parse the JSON response
      const result = await response.json();

      setMessage(result.message);
      if (result.success) {
        const updatedStockrequests = stockRequest.map((stockrequest) =>
          stockrequest._id === result.request._id
            ? result.request
            : stockrequest
        );
        setStockRequests(updatedStockrequests);
        setTimeout(() => {
          setstockDetails(null);
          setIsOpenDetailsSection(false);
          setMessage("");
        }, 2000);
      }
    } catch (error) {
      console.error("Error resolving the request:", error);
      setMessage("An error occurred while resolving the request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-2 lg:px-4 max-w-screen-xl mx-auto">
      <div className="flex justify-center items-center gap-2 mb-2">
        <button
          className="px-3 py-2 border border-gray-800 hover:bg-gray-200 rounded-full flex justify-center items-center gap-2"
          disabled={
            stockRequest.length === 0 ||
            selectedIds.length === stockRequest.length
          }
          onClick={() => {
            setSelectedIds(stockRequest.map((request) => request._id));
          }}
        >
          <div className="flex justify-center items-center outline outline-1 outline-offset-1 outline-gray-800 w-5 h-5 rounded-full">
            {stockRequest.length > 0 &&
              stockRequest.length === selectedIds.length && (
                <FaCircleCheck className="text-gray-800" />
              )}
          </div>
          <div className="font-semibold text-gray-800">Select All</div>
        </button>
        {selectedIds.length > 0 && (
          <button
            onClick={() => {
              setSelectedIds([]);
            }}
            className="px-3 py-2 text-gray-800 border border-gray-800 rounded-full flex justify-center items-center gap-2"
          >
            <RxCrossCircled className="size-6" />
            <div className="font-semibold">Clear</div>
          </button>
        )}
        <button
          disabled={selectedIds.length === 0 || waiting}
          onClick={downloadAllocatedStocks}
          className="px-3 py-2 bg-gray-900 text-white disabled:bg-gray-300 disabled:text-gray-400 rounded-xl font-semibold"
        >
          {waiting ? "Generate..." : "Generate & Download Sheet"}
        </button>
      </div>
      {sheetMessage && (
        <div className="my-1 text-center text-red-500">{sheetMessage}</div>
      )}
      <div className="h-12 px-3 flex rounded-full bg-black text-white">
        <div className="w-[10%] px-2 flex items-center justify-center">
          Sr No.
        </div>
        <div className="w-full px-2 flex items-center ">Medicine</div>
        <div className="w-[25%] px-2 flex items-center">Quantity</div>
        <div className="w-[20%] px-2 flex items-center">Status</div>
      </div>
      {isOpenDetailsSection && (
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
                            <div className="w-1/2 p-2">Boxes</div>
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
                  className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
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
      {stockRequest.length > 0 ? (
        stockRequest.map((request, index) => {
          return (
            <>
              <div
                onClick={() =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
                className="h-12 flex hover:rounded-full text-black border-b-2 border-gray-300 hover:bg-gray-300 cursor-pointer px-3"
                key={index}
              >
                <div className="w-[10%] flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="w-full px-2 flex items-center">
                  {request.medicine.name}
                </div>
                <div className="w-[25%] px-2 flex items-center max-md:hidden">
                  {request.requestedQuantity + " Boxes"}
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
              </div>
              {activeIndex === index && (
                <div className="w-full flex flex-col lg:flex-row justify-around items-center px-3 py-3 bg-gray-200 rounded-b-xl text-center">
                  <div className="font-bold text-black">
                    Requested At:{" "}
                    <span className="text-red-500">
                      {formatDateTimeToIST(request.createdAt)}
                    </span>
                  </div>
                  {request.status === "Pending" && (
                    <div className="flex justify-center items-center gap-2 my-2">
                      <button
                        onClick={() => {
                          handleRemoveRequest(request._id);
                        }}
                        className="py-2 px-4 text-white bg-red-700 hover:bg-red-800 rounded-lg font-semibold flex gap-1 items-center"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          if (selectedIds.some((id) => id === request._id)) {
                            setSelectedIds((ids) =>
                              ids.filter((id) => id !== request._id)
                            );
                          } else setSelectedIds((ids) => [...ids, request._id]);
                        }}
                        className="py-2 px-4 text-red-700 border border-red-700 hover:text-red-800 rounded-lg font-semibold flex gap-1 items-center"
                      >
                        {selectedIds.some((id) => id === request._id)
                          ? "Remove"
                          : "Select"}
                      </button>
                      <button
                        onClick={() => {
                          handleViewDetails(request._id);
                        }}
                        disabled={isOpenDetailsSection}
                        className="py-2 px-4 text-white bg-sky-600 hover:bg-sky-700 rounded-lg font-semibold flex gap-1 items-center"
                      >
                        Godown Transfer Details
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          );
        })
      ) : (
        <div className="text-gray-400 font-semibold text-lg flex flex-col justify-center items-center">
          <MdClearAll className="size-16" />
          <div>No Medicine Requests</div>
        </div>
      )}
    </div>
  );
}

export default StockRequest;
