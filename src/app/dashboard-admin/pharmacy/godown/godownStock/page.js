"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../../components/Navbar";
import GodownStock from "../../../../components/GodownStock";
import { ImBoxRemove } from "react-icons/im";
import { FaSquarePen } from "react-icons/fa6";
import { TiWarning } from "react-icons/ti";

const alphabets = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ#"];

function Page() {
  const [medicineStock, setMedicineStock] = useState({});
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [query, setQuery] = useState("");

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
    fetch(`/api/newStock?letter=${encodedLetter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          let groupdData = groupAndCountMedicines(data.medicineStock);
          console.log(data.medicineStock);
          setMedicineStock(groupdData);
          // setSelectedLetter(Object.keys(groupdData)[0]);
        } else console.log(data.message);
      });
  }, [selectedLetter]);
  return (
    <div>
      <Navbar route={["Pharmacy", "GoDown", "Stock Info"]} />
      <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-2">
        <div className="flex flex-wrap justify-center items-center w-full gap-2 p-2">
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
                {medicineStock && medicineStock[letter]?.requestCount>0 && (
                  <div className="absolute -top-2 -right-2 w-4 aspect-square rounded-full bg-red-600 text-white text-[8px]">
                    {medicineStock[letter].requestCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="w-full flex flex-col justify-center items-center">
          <input
            type="text"
            value={query}
            placeholder="Search"
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-full p-2 italic font-semibold bg-gray-300 text-gray-900 w-3/4 my-2"
          />
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-black">
            <div className="flex items-center gap-1">
              <ImBoxRemove className="text-red-900 text-lg" />
              <div>: Retail Stock Request</div>
            </div>
            <div className="flex items-center gap-1">
              <FaSquarePen className="text-red-900 text-lg" />
              <div>: Min Qty Not Set</div>
            </div>
            <div className="flex items-center gap-1">
              <TiWarning className="text-red-900 text-lg" />
              <div>: Below Stock Limit</div>
            </div>
          </div>
        </div>
      </div>
      <GodownStock
        medicineStock={medicineStock[selectedLetter]}
        query={query}
      />
    </div>
  );
}

export default Page;
