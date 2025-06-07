"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import StockExpiry from "@/app/components/StockExpiry";
import { useStockType } from "@/app/context/StockTypeContext";

function Page() {
  const [stocks, setStocks] = useState([]);
  const [params, setParams] = useState("1year");
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFilteredStocks(stocks);
  }, [stocks]);

  const paramsData = {
    "15days": "days=15",
    "1month": "month=1",
    "3month": "month=3",
    "6month": "month=6",
    "1year": "year=1",
  };
  const sectionType = useStockType();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        fetch(`/api/expiryGodown?${paramsData[params]}&sectionType=${sectionType}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setStocks(data.expiringStocks);
            } else console.log(data.message);
          });
      } catch (err) {
        console.log("error: ", err);
      }
      setLoading(false);
    }
    fetchData();
  }, [params]);

  function updatedata(query) {
    let lowerCaseQuery = query.toLowerCase();
    let filterRes = stocks.filter(
      (req) => true
      // req.medicine.name.toLowerCase().includes(lowerCaseQuery) ||
      // req.medicine.manufacturer.name.toLowerCase().includes(lowerCaseQuery)
    );

    setFilteredStocks(filterRes);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar route={["Hospital", "Godown", "Expiry"]} />
      <div className="flex flex-col justify-around items-center">
        <input
          type="text"
          placeholder="Search"
          onChange={(e) => {
            updatedata(e.target.value);
          }}
          className="h-full w-3/4 text-black text-xl font-medium px-4 py-2 rounded-full outline-none bg-gray-200 border-b-2 border-gray-400 focus:bg-gray-300"
        />
        <div className="flex justify-center gap-3 itmes-center my-2 font-semibold">
          <button
            onClick={() => setParams("15days")}
            className={
              "px-3 py-1 rounded-full border border-gray-900 text-gray-900 " +
              (params === "15days" ? "bg-gray-900 text-white" : "")
            }
          >
            15 Days
          </button>
          <button
            onClick={() => setParams("1month")}
            className={
              "px-3 py-1 rounded-full border border-gray-900 text-gray-900 " +
              (params === "1month" ? "bg-gray-900 text-white" : "")
            }
          >
            1 Month
          </button>
          <button
            onClick={() => setParams("3month")}
            className={
              "px-3 py-1 rounded-full border border-gray-900 text-gray-900 " +
              (params === "3month" ? "bg-gray-900 text-white" : "")
            }
          >
            3 Month
          </button>
          <button
            onClick={() => setParams("6month")}
            className={
              "px-3 py-1 rounded-full border border-gray-900 text-gray-900 " +
              (params === "6month" ? "bg-gray-900 text-white" : "")
            }
          >
            6 Month
          </button>
          <button
            onClick={() => setParams("1year")}
            className={
              "px-3 py-1 rounded-full border border-gray-900 text-gray-900 " +
              (params === "1year" ? "bg-gray-900 text-white" : "")
            }
          >
            1 Year
          </button>
        </div>
      </div>
      <StockExpiry
        stocks={filteredStocks}
        loading={loading}
      />
    </div>
  );
}

export default Page;
