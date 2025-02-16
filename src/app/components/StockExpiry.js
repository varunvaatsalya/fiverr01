"use client";
import React, { useState } from "react";
import { formatDateTimeToIST } from "../utils/date";

function StockExpiry({ stocks,loading }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  return (
    <div className="p-2">
      <div className="bg-gray-900 text-white text-center font-semibold w-full md:w-4/5 lg:w-3/4 py-1 rounded-full mx-auto">
        List of Expiring Medicines
      </div>
      <div className="flex flex-col items-center gap-1">
        {stocks.length > 0 ? (
          stocks.map((stock, index) => (
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
                <div className="w-[50%] px-3">{stock.medicine.name}</div>
                <div className="w-[45%] px-3">{stock.medicine.salts[0].name}</div>
              </div>
              {selectedIndex === index && (
                <div className="p-2 my-1 bg-slate-300 rounded-lg flex flex-col justify-around items-center">
                  <div className="my-1 font-semibold text-gray-700 bg-gray-300 px-4 py-1 rounded-full">
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
                            {formatDateTimeToIST(Stock.expiryDate)}
                          </div>
                          {Stock.quantity && (
                            <div className="lg:w-[45%]">
                              {Stock.quantity.boxes +
                                " Boxes, " +
                                Stock.quantity.extra +
                                " Extras, " +
                                Stock.quantity.totalStrips +
                                " Total"}
                            </div>
                          )}
                          <div className="lg:w-[10%]">{Stock.sellingPrice}</div>
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
          <div className="font-semibold text-lg text-red-400 text-center">
            {loading?"Loading...":"*No Medicines Found"}
          </div>
        )}
      </div>
    </div>
  );
}

export default StockExpiry;
