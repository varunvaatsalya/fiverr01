"use client";
import React, { useEffect, useMemo, useState } from "react";
import { FaChevronCircleDown, FaChevronCircleUp } from "react-icons/fa";

function MedicineSellReport({ setPayload, medicineData, loading, fetchData }) {
  const [manufacturers, setManufacturers] = useState([]);
  const [salts, setSalts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetch("/api/medicineMetaData?manufacturer=1&salts=1")
      .then((res) => res.json())
      .then((data) => {
        setManufacturers(data.response.manufacturers);
        setSalts(data.response.salts);
      });
  }, []);

  const sortedMedicines = useMemo(() => {
    let sortable = [...medicineData];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // If it's an array like 'salts', compare stringified
        if (Array.isArray(valA)) valA = valA.join(", ");
        if (Array.isArray(valB)) valB = valB.join(", ");

        if (typeof valA === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [medicineData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="w-full flex-1 min-h-0 px-2 text-gray-900 bg-slate-200">
      <div className="flex flex-wrap justify-end gap-2 items-center my-0.5">
        <input
          type="datetime-local"
          onChange={(e) => {
            setPayload((prev) => ({ ...prev, startDate: e.target.value }));
          }}
          className="block text-white px-2 py-1 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <input
          type="datetime-local"
          onChange={(e) => {
            setPayload((prev) => ({ ...prev, endDate: e.target.value }));
          }}
          className="block text-white px-2 py-1 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <select
          onChange={(e) => {
            setPayload((prev) => ({ ...prev, manufacturerId: e.target.value }));
          }}
          className=" block px-3 py-2 text-white w-48 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">Select Manufacturer</option>
          {manufacturers.map((manufacturer) => (
            <option key={manufacturer._id} value={manufacturer._id}>
              {manufacturer.name}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => {
            setPayload((prev) => ({ ...prev, saltId: e.target.value }));
          }}
          className=" block px-3 py-2 text-white w-48 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">Select Salt</option>
          {salts.map((salt) => (
            <option key={salt._id} value={salt._id}>
              {salt.name}
            </option>
          ))}
        </select>
        <button
          disabled={loading}
          onClick={fetchData}
          className="px-3 py-1 flex items-center justify-center gap-2 bg-blue-500 rounded-lg font-semibold cursor-pointer text-white"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      <div className="overflow-x-auto flex-1 min-h-0 mt-1 bg-white shadow-md rounded-xl">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-100">
            <tr>
              {[
                "name",
                "manufacturer",
                "salts",
                "netRevenue",
                "netStripsSold",
              ].map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="py-2 px-4 text-left cursor-pointer select-none hover:bg-gray-200 font-semibold transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    {col.toUpperCase()}
                    {sortConfig.key === col &&
                      (sortConfig.direction === "asc" ? (
                        <FaChevronCircleUp />
                      ) : (
                        <FaChevronCircleDown />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedMedicines.map((med) => (
              <tr
                key={med._id}
                className="border-t hover:bg-gray-50 transition whitespace-nowrap"
              >
                <td className="py-2 px-4">{med.name}</td>
                <td className="py-2 px-4">{med.manufacturer}</td>
                <td className="py-2 px-4">{med.salts.join(", ")}</td>
                <td className="py-2 px-4">
                  ₹{parseFloat(med.netRevenue.toFixed(2))}
                </td>
                <td className="py-2 px-4">
                  {parseFloat(med.netStripsSold?.toFixed(2))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MedicineSellReport;
