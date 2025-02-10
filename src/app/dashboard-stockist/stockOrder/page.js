"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import StockOrder from "../../components/StockOrder";

function Page() {
  const [info, setInfo] = useState([]);
  const [selectedType, setSelectedType] = useState("manufacturer");

  useEffect(() => {
    fetch(`/api/medicineMetaData?${selectedType}=1`)
      .then((res) => res.json())
      .then((data) => {
        setInfo(selectedType === "manufacturer"?data.response.manufacturers:data.response.vendors);
        console.log(selectedType === "manufacturer"?data.response.manufacturers:data.response.vendors);
      });
  }, [selectedType]);
  return (
    <div className="bg-slate-800 min-h-screen w-full">
      <Navbar route={["Godown", "Stock Order"]} />
      <div className="flex justify-center items-center gap-3 p-2">
        <button
          onClick={() => {
            setSelectedType("manufacturer");
            
          }}
          className={
            "px-3 py-2 text-lg text-white font-semibold rounded-full border-slate-900 " +
            (selectedType === "manufacturer"
              ? "bg-sky-700"
              : "text-slate-900 border")
          }
        >
          Manufacturer
        </button>
        <button
          onClick={() => {
            setSelectedType("vendor");
            
          }}
          className={
            "px-3 py-2 text-lg text-white font-semibold rounded-full border-slate-900 " +
            (selectedType === "vendor"
              ? "bg-sky-700"
              : "text-slate-900 border")
          }
        >
          Vendor
        </button>
      </div>
      <StockOrder info={info} selectedType={selectedType} />
    </div>
  );
}

export default Page;
