"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import StockExpiry from "@/app/components/StockExpiry";
import { showError } from "@/app/utils/toast";

const paramsData = {
  expired: "expired=1",
  "15days": "days=15",
  "1month": "month=1",
  "3month": "month=3",
  "6month": "month=6",
  "1year": "year=1",
};

export default function Page() {
  const [stocks, setStocks] = useState([]);
  const [params, setParams] = useState("15days");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/expiryRetails?${paramsData[params]}`);
        const data = await res.json();
        if (data.success) {
          setStocks(data.expiringStocks);
        } else {
          showError(data.message || "Error in fetching Medicines Details!");
        }
      } catch (err) {
        console.log("error: ", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar route={["Pharmacy", "Retails", "Expiry"]} />
      <StockExpiry
        stocks={stocks}
        loading={loading}
        params={params}
        setParams={setParams}
        query={query}
        setQuery={setQuery}
      />
    </div>
  );
}
