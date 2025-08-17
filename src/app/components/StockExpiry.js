"use client";
import React, { useState } from "react";
import { formatDateToIST } from "@/app/utils/date";
import { FaAngleRight } from "react-icons/fa";

const ranges = [
  { label: "Expired", value: "expired" },
  { label: "15 Days", value: "15days" },
  { label: "1 Month", value: "1month" },
  { label: "3 Month", value: "3month" },
  { label: "6 Month", value: "6month" },
  { label: "1 Year", value: "1year" },
];

function StockExpiry({ stocks, loading, params, setParams, query, setQuery }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const filteredStocks = stocks.filter((s) => {
    const q = query.toLowerCase();
    return s.medicine.name.toLowerCase().includes(q);
  });

  return (
    <div className="">
      <div className="flex flex-col justify-around items-center">
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-full w-3/4 text-black text-xl font-medium px-4 py-2 rounded-full outline-none bg-gray-200 border-b-2 border-gray-400 focus:bg-gray-300"
        />
        <div className="flex justify-center gap-3 items-center my-2 font-semibold">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setParams(r.value)}
              className={
                "px-3 py-1 rounded-full border border-gray-900 text-gray-900 " +
                (params === r.value ? "bg-gray-900 text-white" : "")
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-2">
        <div className="bg-gray-900 text-white text-center font-semibold w-full md:w-4/5 lg:w-3/4 py-1 rounded-full mx-auto">
          List of Expiring Medicines
        </div>
        <div className="flex flex-col items-center gap-1">
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock, index) => (
              <div key={index} className="w-full md:w-4/5 lg:w-3/4">
                <div
                  onClick={() =>
                    setSelectedIndex(selectedIndex === index ? null : index)
                  }
                  className={
                    "flex items-center font-semibold px-4 py-2 rounded-full cursor-pointer text-gray-900 hover:bg-gray-300 " +
                    (selectedIndex === index ? "bg-gray-300" : "bg-gray-200")
                  }
                >
                  <div className="w-10">{index + 1 + "."}</div>
                  <div className="flex-1 px-3">{stock.medicine.name}</div>
                  <div className="flex-1 px-3">
                    {stock.medicine.salts[0].name}
                  </div>
                  <div className="w-24 px-3 text-sm italic">
                    {stock.stocks.length > 0
                      ? `${stock.stocks.length} Batch`
                      : ""}
                  </div>
                  <div className="w-12 px-2">
                    <FaAngleRight
                      className={
                        "size-4 text-gray-600 " +
                        (selectedIndex === index ? "rotate-90" : "")
                      }
                    />
                  </div>
                </div>
                {selectedIndex === index && (
                  <div className="p-2 my-1 bg-gray-300 rounded-lg flex flex-col gap-1 justify-around items-center">
                    <div className="font-semibold text-gray-800 bg-gray-200 rounded-full px-2">
                      Expiring Stocks
                    </div>
                    <div className="w-full flex flex-col itmes-center gap-2 px-2">
                      {stock.stocks.length > 0 ? (
                        stock.stocks.map((Stock) => (
                          <div
                            key={Stock._id}
                            className="bg-gray-800 text-white rounded-full py-1 px-4 flex flex-col lg:flex-row justify-center items-center"
                          >
                            <div className="lg:w-[15%]">{Stock.batchName}</div>
                            <div className="lg:w-[30%]">
                              {`Expiry: ${formatDateToIST(Stock.expiryDate)}`}
                            </div>
                            {Stock.quantity && (
                              <div className="lg:w-[45%]">
                                {Stock.quantity.totalStrips +
                                  " Total Strips = " +
                                  (Stock.quantity.boxes || 0) +
                                  " Boxes, " +
                                  (Stock.quantity.extra || 0) +
                                  " Extras"}
                              </div>
                            )}
                            <div className="lg:w-[10%]">{`MRP: ${Stock.sellingPrice}`}</div>
                          </div>
                        ))
                      ) : (
                        <div className="font-semibold text-red-600 text-center">
                          No Expiring Stocks found.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="font-semibold text-lg text-gray-400 text-center">
              {loading ? "Loading..." : "*No Medicines Found"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StockExpiry;
