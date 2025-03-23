"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../../components/Navbar";

function Page() {
  const [letter, setLetter] = useState("a");
  
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch(`/api/medicinesInfo?letter=`);
        result = await result.json();
        if (result.success) {
          setPatients(result.patientsList);
          setMedicines(result.medicinesList);
          setSearchedMedicines(result.medicinesList);
        } else {
          setMessage(result.message);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  function searchQuery(query) {}
  return (
    <div className="flex flex-col h-screen min-h-screen bg-slate-900">
      <Navbar route={["Pharmcy", "Config", "Info"]} />
      <div className="w-full my-1 flex justify-around flex-wrap items-center gap-4">
        <div className="text-slate-400 font-semibold">
          Medicines Stocks Infos
        </div>
        <input
          type="text"
          onChange={(e) => searchQuery(e.target.value)}
          className="px-2 py-0.5 w-1/4 rounded-lg bg-slate-800 text-slate-200 focus:outline-none"
          placeholder="Search"
        />
      </div>
      <div className="flex-1 bg-slate-950 w-full"></div>
    </div>
  );
}

export default Page;
