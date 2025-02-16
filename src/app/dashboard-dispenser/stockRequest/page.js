"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../../components/Navbar";
import RetailStockRequest from "../../../../components/RetailStockRequest";

function Page() {
  const [medicineStock, setMedicineStock] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(`/api/stockRetail/outofstockmedicines?letter=${selectedLetter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMedicineStock(data.medicines);
          console.log(data.medicines)
        } else console.log(data.message);
      });
  }, [selectedLetter]);

  return (
    <div>
      <Navbar route={["Pharmacy", "Retails", "Stock Request"]} />
      <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-2 my-2">
        <div className="flex flex-wrap justify-center items-center w-full gap-2 px-2">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => {
            return (
              <button
                key={letter}
                onClick={() => {
                  setSelectedLetter(letter);
                }}
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
        <div className="w-full flex justify-center items-center">
          <input
            type="text"
            value={query}
            placeholder="Search"
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-full p-2 italic font-semibold bg-gray-300 text-gray-900 w-3/4"
          />
        </div>
      </div>
      <RetailStockRequest
        medicineStock={medicineStock}
        setMedicineStock={setMedicineStock}
        query={query}
      />
    </div>
  );
}

export default Page;
