"use client";
import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { formatDateTimeToIST } from "../utils/date";
import { format } from "date-fns";

function RequestSearchList({
  stockRequests,
  page,
  setPage,
  query,
  setQuery,
  selectedStatus,
  setSelectedStatus,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const statuses = [
    {
      label: "All",
      value: "All",
      border: "border-blue-500",
      text: "text-blue-800",
    },
    {
      label: "Fulfilled",
      value: "Fulfilled",
      border: "border-green-500",
      text: "text-green-500",
    },
    {
      label: "Fulfilled (Partial)",
      value: "Fulfilled (Partial)",
      border: "border-teal-500",
      text: "text-teal-500",
    },
    {
      label: "Pending",
      value: "Pending",
      border: "border-yellow-500",
      text: "text-yellow-600",
    },
    {
      label: "Approved",
      value: "Approved",
      border: "border-violet-600",
      text: "text-violet-600",
    },
    {
      label: "Returned",
      value: "Returned",
      border: "border-pink-600",
      text: "text-pink-600",
    },
    {
      label: "Rejected",
      value: "Rejected",
      border: "border-red-500",
      text: "text-red-500",
    },
    {
      label: "Disputed",
      value: "Disputed",
      border: "border-sky-600",
      text: "text-sky-600",
    },
  ];

  const statusStyle = {
    Fulfilled: "bg-green-200 text-green-700",
    "Fulfilled (Partial)": "bg-teal-200 text-teal-800",
    Pending: "bg-yellow-200 text-yellow-500",
    Approved: "bg-violet-200 text-violet-500",
    Returned: "bg-pink-200 text-pink-500",
    Rejected: "bg-red-200 text-red-500",
    Disputed: "bg-rose-200 text-rose-500",
  };

  const handleNextPage = () => {
    if (stockRequests.length === 50) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div className="px-2 py-1 flex flex-col justify-center items-center flex-1">
      <input
        type="text"
        placeholder="Search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
        className="h-full w-full lg:w-3/4 text-black text-xl font-medium px-4 py-2 rounded-full outline-none bg-gray-200 border-b-2 border-gray-400 focus:bg-gray-300"
      />
      <div className="flex justify-center items-center border-b border-gray-400 text-gray-800 font-semibold">
        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => setSelectedStatus(status.value)}
            className={
              "px-3 py-2 border-b-2 " +
              (selectedStatus === status.value
                ? `${status.border} ${status.text}`
                : "border-gray-100")
            }
          >
            {status.label}
          </button>
        ))}
      </div>
      <div className="flex-1 w-full p-2 overflow-y-auto flex flex-col items-center gap-1">
        {stockRequests.length > 0 ? (
          stockRequests.map((req, index) => (
            <div key={index} className="w-full md:w-4/5 lg:w-3/4">
              <div
                onClick={() =>
                  setSelectedIndex(selectedIndex === index ? null : index)
                }
                className={
                  "flex font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300 " +
                  (selectedIndex === index
                    ? "bg-gray-300 text-blue-950"
                    : "bg-gray-200 text-gray-900")
                }
              >
                <div className="w-[5%]">{index + 1 + "."}</div>
                <div className="w-[50%] px-3">{req.medicineData.name}</div>
                <div className={` px-3 rounded-lg ${statusStyle[req.status]}`}>
                  {req.status}
                </div>
              </div>
              {selectedIndex === index && (
                <div className="p-2 my-1 bg-slate-300 rounded-lg flex flex-col justify-around items-center">
                  <div className="font-semibold text-gray-900">
                    Manufacturer:{" "}
                    <span className="text-blue-500">
                      {req.manufacturerData.name}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    Requested Quantity:{" "}
                    <span className="text-blue-500">
                      {req.requestedQuantity}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    Entered Remaining Quantity:{" "}
                    <span className="text-blue-500">
                      {req.enteredRemainingQuantity}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    Actual Remaining Quantity:{" "}
                    <span className="text-blue-500">
                      {req.actualRemainingQuantity}
                    </span>
                  </div>
                  {req.approvedAt && (
                    <div className="font-semibold text-gray-900">
                      Approved At:{" "}
                      <span className="text-blue-500 uppercase">
                        {formatDateTimeToIST(req.approvedAt)}
                      </span>
                    </div>
                  )}
                  <div className="font-semibold text-gray-900">
                    Retail Received Status:{" "}
                    <span className="text-blue-500">{req.receivedStatus}</span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    Received/Rejected At:{" "}
                    <span className="text-blue-500 uppercase">
                      {req.receivedAt
                        ? formatDateTimeToIST(req.receivedAt)
                        : "--"}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-900">
                    Requested Date:{" "}
                    <span className="text-blue-500 uppercase">
                      {formatDateTimeToIST(req.createdAt)}
                    </span>
                  </div>
                  <div className="my-1 font-semibold text-violet-700 bg-violet-300 px-4 py-1 rounded-full">
                    Approved Stocks
                  </div>
                  <div className="w-full flex flex-col itmes-center gap-2 px-2">
                    {req.approvedQuantity.length > 0 ? (
                      req.approvedQuantity.map((stock) => (
                        <div
                          key={stock._id}
                          className="bg-gray-800 text-white rounded-full py-1 px-4 flex flex-col lg:flex-row justify-center items-center"
                        >
                          <div className="lg:w-[15%]">{stock.batchName}</div>
                          <div className="lg:w-[30%]">
                            {"Expiry: "+format(new Date(stock.expiryDate), "MM/yy")}
                          </div>
                          {stock.quantity && (
                            <div className="lg:w-[45%]">
                              {stock.quantity.boxes +
                                " Boxes, " +
                                stock.quantity.extra +
                                " Extras, " +
                                stock.quantity.totalStrips +
                                " Total"}
                            </div>
                          )}
                          <div className="lg:w-[10%]">
                            {"MRP: " + stock.sellingPrice}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="font-semibold text-red-600 text-center">
                        No any approved Stocks is available.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="font-semibold text-lg text-red-400 text-center">
            *No Requests Found
          </div>
        )}
      </div>
      <div className="w-full flex justify-end gap-2 pr-4 ">
        <div className="bg-gray-900 rounded-lg">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1}
            className="p-3"
          >
            <FaArrowLeft size={20} />
          </button>
          <span className="text-white border-x border-white p-3">
            Page {page}
          </span>
          <button
            onClick={handleNextPage}
            disabled={stockRequests.length < 50}
            className="p-3"
          >
            <FaArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequestSearchList;
