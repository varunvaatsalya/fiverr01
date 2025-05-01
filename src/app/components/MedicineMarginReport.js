"use client";
import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { FaCircleMinus, FaCirclePlus } from "react-icons/fa6";

const initialVisibleColumns = {
  batch1: true,
  batch2: true,
  batch3: true,
  purchase1: true,
  purchase2: true,
  purchase3: true,
  mrp1: true,
  mrp2: true,
  mrp3: true,
  profitAmount1: true,
  profitAmount2: true,
  profitAmount3: true,
  profitPercent1: true,
  profitPercent2: true,
  profitPercent3: true,
};

function MedicineMarginReport({
  payload,
  setPayload,
  marginData,
  loading,
  fetchData,
}) {
  const [manufacturers, setManufacturers] = useState([]);
  const [salts, setSalts] = useState([]);

  useEffect(() => {
    fetch("/api/medicineMetaData?manufacturer=1&salts=1")
      .then((res) => res.json())
      .then((data) => {
        setManufacturers(data.response.manufacturers);
        setSalts(data.response.salts);
      });
  }, []);

  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);

  const toggleColumn = (colName) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [colName]: !prev[colName],
    }));
  };

  return (
    <div className="w-full flex-1 min-h-0 px-2 text-gray-900 bg-slate-200">
      <div className="flex flex-col lg:flex-row justify-between px-2 gap-2 items-center my-0.5">
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(initialVisibleColumns).map((col) => (
            <button
              key={col}
              onClick={() => toggleColumn(col)}
              className={`px-2 py-1 rounded flex justify-center items-center gap-1 text-xs ${
                visibleColumns[col]
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {visibleColumns[col] ? (
                <>
                  <FaCircleMinus className="size-3" />
                  <div>{col}</div>
                </>
              ) : (
                <>
                  <FaCirclePlus  className="size-3" />
                  <div>{col}</div>
                </>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2">
          <select
            onChange={(e) => {
              setPayload((prev) => ({ ...prev, manufacturer: e.target.value }));
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
              setPayload((prev) => ({ ...prev, salt: e.target.value }));
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
            disabled={loading || (!payload.manufacturer && !payload.salt)}
            onClick={fetchData}
            className="px-3 py-1 flex items-center justify-center gap-2 bg-blue-500 rounded-lg font-semibold cursor-pointer text-white"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {/* Toggle buttons */}

        {/* Table */}
        <table className="min-w-full table-auto text-sm bg-white rounded-xl shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4">Medicine</th>
              <th className="py-2 px-4">Manufacturer</th>
              <th className="py-2 px-4">Salt</th>

              {[1, 2, 3].map(
                (i) =>
                  visibleColumns[`batch${i}`] && (
                    <th
                      key={`batch${i}`}
                      className="py-2 px-4"
                    >{`Batch${i}`}</th>
                  )
              )}
              {[1, 2, 3].map(
                (i) =>
                  visibleColumns[`purchase${i}`] && (
                    <th
                      key={`purchase${i}`}
                      className="py-2 px-4"
                    >{`Purchase${i}`}</th>
                  )
              )}
              {[1, 2, 3].map(
                (i) =>
                  visibleColumns[`mrp${i}`] && (
                    <th key={`mrp${i}`} className="py-2 px-4">{`MRP${i}`}</th>
                  )
              )}
              {[1, 2, 3].map(
                (i) =>
                  visibleColumns[`profitAmount${i}`] && (
                    <th
                      key={`profitAmount${i}`}
                      className="py-2 px-4"
                    >{`Profit Amt${i}`}</th>
                  )
              )}
              {[1, 2, 3].map(
                (i) =>
                  visibleColumns[`profitPercent${i}`] && (
                    <th
                      key={`profitPercent${i}`}
                      className="py-2 px-4"
                    >{`Profit %${i}`}</th>
                  )
              )}
            </tr>
          </thead>
          <tbody>
            {marginData.map((med) => (
              <tr
                key={med._id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="py-2 px-4">{med.name}</td>
                <td className="py-2 px-4">{med.manufacturer.name}</td>
                <td className="py-2 px-4">{med.salt.name}</td>

                {[0, 1, 2].map((i) =>
                  visibleColumns[`batch${i + 1}`] ? (
                    <td key={`batch-${i}`} className="py-2 px-4">
                      {med.stocks[i]?.batchName || "-"}
                    </td>
                  ) : null
                )}
                {[0, 1, 2].map((i) =>
                  visibleColumns[`purchase${i + 1}`] ? (
                    <td key={`purchase-${i}`} className="py-2 px-4">
                      ₹{med.stocks[i]?.purchasePrice ?? "-"}
                    </td>
                  ) : null
                )}
                {[0, 1, 2].map((i) =>
                  visibleColumns[`mrp${i + 1}`] ? (
                    <td key={`mrp-${i}`} className="py-2 px-4">
                      ₹{med.stocks[i]?.sellingPrice ?? "-"}
                    </td>
                  ) : null
                )}
                {[0, 1, 2].map((i) =>
                  visibleColumns[`profitAmount${i + 1}`] ? (
                    <td key={`profitAmt-${i}`} className="py-2 px-4">
                      ₹{med.stocks[i]?.profitAmount ?? "-"}
                    </td>
                  ) : null
                )}
                {[0, 1, 2].map((i) =>
                  visibleColumns[`profitPercent${i + 1}`] ? (
                    <td key={`profitPercent-${i}`} className="py-2 px-4">
                      {med.stocks[i]
                        ? `${parseFloat(
                            med.stocks[i].profitPercent?.toFixed(2)
                          )}%`
                        : "-"}
                    </td>
                  ) : null
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MedicineMarginReport;
