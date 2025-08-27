"use client";
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "@/app/components/Navbar";
import RetailStockRequest from "@/app/components/RetailStockRequest";
import { useStockType } from "@/app/context/StockTypeContext";
import { showError } from "@/app/utils/toast";

function Page() {
  const sectionType = useStockType();
  const [medicineStock, setMedicineStock] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [filterType, setFilterType] = useState("outofstock");
  const [query, setQuery] = useState("");
  const [finding, setFinding] = useState(false);

  useEffect(() => {
    setFinding(true);
    fetch(
      `/api/stockRetail/outofstockmedicines?letter=${selectedLetter}&sectionType=${sectionType}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMedicineStock(data.medicines);
        } else showError(data.message || "Stock Details Fetch Error");
      });
    setFinding(false);
  }, [selectedLetter]);

  useEffect(() => {
    if (query.length > 0) {
      const firstChar = query[0].toUpperCase();
      const isAlphabet = /^[A-Z]$/.test(firstChar);

      if (firstChar !== selectedLetter) {
        setSelectedLetter(isAlphabet ? firstChar : "#");
      }
    }
  }, [query]);

  const filteredMedicines = useMemo(() => {
    return medicineStock.filter((med) => {
      if (filterType === "all") return true;

      if (filterType === "pending") {
        return med.requests?.some((req) => req.status === "Pending");
      }

      if (filterType === "approved") {
        return med.requests?.some((req) => req.status === "Approved");
      }

      if (filterType === "belowminimum") {
        return med.totalStrips < (med.minimumStockCount || 0);
      }
      if (filterType === "outofstock") {
        return med.totalStrips < (med.minimumStockCount / 2 || 0);
      }

      return true;
    });
  }, [medicineStock, filterType]);

  const searchedMedicines = useMemo(() => {
    return filteredMedicines.filter((med) =>
      med.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [filteredMedicines, query]);

  return (
    <div>
      <Navbar route={["Pharmacy", "Retails", "Stock Request"]} />
      <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-2 my-2">
        <div className="flex flex-wrap justify-center items-center w-full lg:w-1/2 gap-2 px-2">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("").map((letter) => {
            return (
              <button
                key={letter}
                onClick={() => {
                  setSelectedLetter(letter);
                }}
                disabled={finding}
                className={
                  "w-8 text-sm aspect-square border border-gray-900 text-black hover:bg-gray-800 hover:text-gray-100 rounded flex justify-center items-center" +
                  (selectedLetter === letter
                    ? " bg-gray-800 text-gray-100"
                    : "")
                }
              >
                {letter}
              </button>
            );
          })}
        </div>
        <div className="w-full lg:w-1/2 flex justify-center items-center gap-2 ">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={
              "px-3 py-1 text-sm rounded-lg bg-gray-300 font-semibold text-black"
            }
          >
            <option value="all">All</option>
            <option value="outofstock">Out of Stock</option>
            <option value="belowminimum">Below Minimum</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="rounded-full p-2 italic font-semibold bg-gray-300 text-gray-900 w-3/4"
          />
        </div>
      </div>
      <RetailStockRequest
        filteredMedicines={filteredMedicines}
        searchedMedicines={searchedMedicines}
        setMedicineStock={setMedicineStock}
        query={query}
        filterType={filterType}
        finding={finding}
      />
    </div>
  );
}

export default Page;
