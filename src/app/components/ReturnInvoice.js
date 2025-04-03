import React from "react";
import { FaArrowLeft } from "react-icons/fa6";

function ReturnInvoice({ returnInvoice, setReturnInvoice }) {
  return (
    <div className="min-h-screen w-full bg-gray-950 text-white px-2">
      <div className="flex items-center gap-2 p-2">
        <button
          onClick={() => {
            setReturnInvoice(null);
          }}
          className="p-2 rounded-full hover:bg-slate-900"
        >
          <FaArrowLeft className="size-5" />
        </button>
        <div className="font-semibold text-lg">
          Pharmcy Invoice Return Details
        </div>
      </div>
      <div className="flex items-center">
        <div className="">
          Patient Name:{" "}
          <span className="text-blue-600">{returnInvoice.patientId?.name}</span>
        </div>
      </div>
      <hr className="my-2 border-t border-gray-700" />
      <div className=" text-center font-semibold">Return History</div>
      {returnInvoice.returns ? (
        <></>
      ) : (
        <div className="text-center font-semibold text-gray-600">
          No return record found!
        </div>
      )}
      <hr className="my-2 border-t border-gray-700" />
      <div className="bg-gray-700 text-gray-300 rounded-lg flex flex-wrap items-center justify-around gap-1 font-semibold text-sm py-1 px-2">
        <div className="flex-1 min-w-28 text-center">Batch</div>
        <div className="flex-1 min-w-28 text-center">Expiry</div>
        <div className="flex-1 min-w-28 text-center">Qty/Strps</div>
        <div className="flex-1 min-w-28 text-center">Tablets</div>
        <div className="flex-1 min-w-28 text-center">MRP</div>
        <div className="flex-1 min-w-28 text-center">Tblts/Strps</div>
        <div className="flex-1 min-w-28 text-center">ret</div>
      </div>

    </div>
  );
}

export default ReturnInvoice;
