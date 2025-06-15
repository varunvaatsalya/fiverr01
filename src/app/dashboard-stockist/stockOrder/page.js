"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import StockOrder from "@/app/components/StockOrder";
import Loading from "@/app/components/Loading";

function Page() {
  const [loading, setLoading] = useState(true);
  const [manufacturers, setManufacturers] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/medicineMetaData?manufacturer=1&vendor=1`)
      .then((res) => res.json())
      .then((data) => {
        setManufacturers(data.response.manufacturers);
        setVendors(data.response.vendors);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching metadata:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-slate-800 min-h-screen w-full">
      <Navbar route={["Pharmacy", "Stock Order"]} />
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2">
          <Loading size={50} />
          <div className="text-lg font-semibold">Loading... Meta Data</div>
        </div>
      ) : (
        <StockOrder manufacturers={manufacturers} vendors={vendors} />
      )}
    </div>
  );
}

export default Page;
