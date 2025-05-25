import React from "react";
import { formatDateToIST } from "../utils/date";

function StockDetails({ stockDetails, setStockDetails }) {
  console.log(stockDetails);
  return (
    <div className="absolute top-0 left-0">
      <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
        <div className="w-[95%] md:w-4/5 lg:w-3/4 py-4 flex flex-col items-center gap-1 text-center bg-slate-950 px-4 rounded-xl">
          <div className="text-center py-2 px-4 rounded-full bg-slate-900 text-lg text-white font-semibold">
            Medicine Stock Details
          </div>
          <div className="max-h-[60vh] w-full overflow-y-auto flex flex-col gap-2">
            {stockDetails.stocks.length > 0 ? (
              <>
                <div className="mb-1 flex flex-wrap items-center bg-gray-800 rounded-lg text-sm text-white">
                  <div className="flex-1 min-w-24 px-0.5 line-clamp-1">
                    Medicine
                  </div>
                  <div className="flex-1 min-w-24">Batch</div>
                  <div className="flex-1 min-w-48">Expiry</div>
                  <div className="flex-1 min-w-36">Quantity</div>
                  <div className="flex-1 min-w-36">Free</div>
                  <div className="flex-1 min-w-16">MRP</div>
                  <div className="flex-1 min-w-16">Rate</div>
                  <div className="flex-1 min-w-20">Subtotal</div>
                </div>
                {stockDetails.stocks.map((stock) => (
                  <div
                    key={stock.stockId._id}
                    className="mb-1 flex flex-wrap items-center border-b border-gray-800 text-sm text-white"
                  >
                    <div className="flex-1 min-w-24 px-0.5 line-clamp-1">
                      {stock.stockId.medicine?.name}
                    </div>
                    <div className="flex-1 min-w-24">
                      {stock.stockId.batchName}
                    </div>
                    <div className="flex-1 min-w-48">
                      {formatDateToIST(stock.stockId.expiryDate)}
                    </div>
                    <div className="flex-1 min-w-36">
                      {stock.stockId.initialQuantity.totalStrips}
                    </div>
                    <div className="flex-1 min-w-36">
                      {stock.stockId.initialQuantity.free}
                    </div>
                    <div className="flex-1 min-w-16">
                      {stock.stockId.sellingPrice}
                    </div>
                    <div className="flex-1 min-w-16">
                      {stock.stockId.purchasePrice}
                    </div>
                    <div className="flex-1 min-w-20">
                      {stock.stockId.totalAmount}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-gray-500 font-semibold text-lg">
                *No Medicine Stock Records
              </div>
            )}
          </div>
          <div className="w-full flex px-4 gap-3 my-3 justify-end">
            <div
              className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
              onClick={() => {
                setStockDetails(null);
              }}
            >
              Cancel
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockDetails;
