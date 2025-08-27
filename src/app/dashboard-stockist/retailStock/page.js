"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import RetailStock from "@/app/components/RetailStock";
import { showError } from "@/app/utils/toast";

const alphabets = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ#"];

function Page() {
  const [medicineStock, setMedicineStock] = useState({});
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (query.length > 0) {
      const firstChar = query[0].toUpperCase();
      const isAlphabet = /^[A-Z]$/.test(firstChar);

      if (firstChar !== selectedLetter) {
        setSelectedLetter(isAlphabet ? firstChar : "#");
      }
    }
  }, [query]);

  const groupAndCountMedicines = (medicines) => {
    const grouped = {};
    medicines.forEach((medicine) => {
      const firstLetter = medicine.name[0].toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = {
          medicines: [],
          requestCount: 0,
        };
      }
      grouped[firstLetter].medicines.push(medicine);
      const requestCount = medicine.requests ? medicine.requests.length : 0;
      grouped[firstLetter].requestCount += requestCount;
    });
    return grouped;
  };

  useEffect(() => {
    const encodedLetter = encodeURIComponent(selectedLetter);
    fetch(`/api/stockRetail?letter=${encodedLetter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          let groupdData = groupAndCountMedicines(data.medicines);
          // console.log(data.medicines);
          setMedicineStock(groupdData);
        } else showError(data.message);
      });
  }, [selectedLetter]);

  return (
    <div>
      <Navbar route={["Pharmacy", "Retails", "Stock Info"]} />
      <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-2 my-2">
        <div className="flex flex-wrap justify-center items-center w-full gap-2 px-2">
          {alphabets.map((letter) => {
            return (
              <button
                key={letter}
                onClick={() => {
                  setSelectedLetter(letter);
                }}
                className={
                  "w-8 text-sm aspect-square border relative border-gray-900 text-black hover:bg-gray-800 hover:text-gray-100 rounded flex justify-center items-center" +
                  (selectedLetter === letter
                    ? " bg-gray-800 text-gray-100"
                    : "")
                }
              >
                {letter}
                {medicineStock && medicineStock[letter]?.requestCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-4 aspect-square rounded-full bg-red-600 text-white text-[8px]">
                    {medicineStock[letter].requestCount}
                  </div>
                )}
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
      <RetailStock
        medicineStock={medicineStock[selectedLetter]}
        setMedicineStock={setMedicineStock}
        selectedLetter={selectedLetter}
        query={query}
      />
    </div>
  );
}

export default Page;
