"use client"
import React, { useState } from "react";

function PurchaseHistory() {
  const [status, setStatus] = useState("unpaid");
  return (
    <div className="px-2 my-1">
      <div className="flex justify-end items-center gap-2">
        <button
          className={
            "py-1 px-4 rounded-full text-sm font-semibold border border-gray-900 " +
            (status === "unpaid" ? "bg-gray-900 text-white" : "text-gray-900")
          }
          onClick={() => setStatus("unpaid")}
        >
          Unpaid
        </button>
        <button
          className={
            "py-1 px-4 rounded-full text-sm font-semibold border border-gray-900 " +
            (status === "all" ? "bg-gray-900 text-white" : "text-gray-900")
          }
          onClick={() => setStatus("all")}
        >
          All
        </button>
      </div>
      
    </div>
  );
}

export default PurchaseHistory;
