"use client";
import React from "react";
import { formatDateToIST } from "../utils/date";

function MedicineSellRecord({ medicineData, loading, updateData }) {
  return (
    <div className="w-full flex-1 min-h-0 px-2 text-gray-900 bg-slate-200">
      <div className="flex flex-wrap justify-end gap-2 items-center my-0.5">
        <button
          disabled={loading}
          onClick={updateData}
          className="px-3 py-1 flex items-center justify-center gap-2 bg-blue-500 rounded-lg font-semibold cursor-pointer text-white"
        >
          {loading ? "Wait..." : "Update"}
        </button>
      </div>
      <div className="overflow-x-auto flex-1 min-h-0 mt-1 bg-white shadow-md rounded-xl">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-100">
            <tr>
              {["Name", "1m", "2m", "3m", "6m", "12m", "Last Update"].map(
                (col) => (
                  <th
                    key={col}
                    className="py-2 px-4 text-left select-none hover:bg-gray-200 font-semibold transition whitespace-nowrap"
                  >
                    <div className="flex items-center gap-2">{col}</div>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {medicineData.map((med) => (
              <tr
                key={med._id}
                className="border-t hover:bg-gray-50 transition whitespace-nowrap"
              >
                <td className="py-2 px-4">{med.name}</td>
                <td className="py-2 px-4">
                  {med.avgMonthlyBoxes ? med.avgMonthlyBoxes["1m"] : "--"}
                </td>
                <td className="py-2 px-4">
                  {med.avgMonthlyBoxes ? med.avgMonthlyBoxes["2m"] : "--"}
                </td>
                <td className="py-2 px-4">
                  {med.avgMonthlyBoxes ? med.avgMonthlyBoxes["3m"] : "--"}
                </td>
                <td className="py-2 px-4">
                  {med.avgMonthlyBoxes ? med.avgMonthlyBoxes["6m"] : "--"}
                </td>
                <td className="py-2 px-4">
                  {med.avgMonthlyBoxes ? med.avgMonthlyBoxes["12m"] : "--"}
                </td>

                <td className="py-2 px-4">
                  {med.avgMonthlyBoxes ? formatDateToIST(med.avgMonthlyBoxes.savedAt) : "--"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MedicineSellRecord;
