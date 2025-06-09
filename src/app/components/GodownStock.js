"use client";
import React, { useEffect, useState } from "react";
import { ImBoxRemove } from "react-icons/im";
import { BiInjection } from "react-icons/bi";
import { TiWarning } from "react-icons/ti";
import { FaSquarePen } from "react-icons/fa6";
import { IoIosRemoveCircle } from "react-icons/io";
import { showError } from "../utils/toast";
import { useStockType } from "../context/StockTypeContext";

function GodownStock({ medicineStock, query }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [filteredMedicines, setFilteredMedicines] = useState(
    medicineStock?.medicines
  );

  const sectionType = useStockType();

  useEffect(() => {
    setFilteredMedicines(medicineStock?.medicines);
    console.log(medicineStock?.medicines);
  }, [medicineStock]);

  useEffect(() => {
    if (medicineStock?.medicines) {
      let filtered = medicineStock.medicines;

      if (query) {
        filtered = filtered.filter((medicine) =>
          medicine.name.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (onlyInStock) {
        filtered = filtered.filter(
          (medicine) =>
            medicine.stocks.reduce(
              (acc, stock) => acc + stock.quantity.totalStrips,
              0
            ) > 0
        );
      }

      setFilteredMedicines(filtered);
    }
  }, [query, onlyInStock, medicineStock]);

  async function handleSetMaxQty(id) {
    setSubmitting(true);
    try {
      let result = await fetch("/api/newMedicine?maxqty=1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          godownMaxQty: maxQty,
          sectionType,
        }),
      });
      result = await result.json();
      if (result.success) {
        const updatedMedicines = filteredMedicines.map((medicine) =>
          medicine._id === id
            ? {
                ...medicine,
                maximumStockCount: {
                  ...medicine.maximumStockCount,
                  godown: maxQty,
                },
              }
            : medicine
        );
        setFilteredMedicines(updatedMedicines);
        setMaxQty("");
      } else showError(result.message);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSetMinQty(id) {
    setSubmitting(true);
    try {
      let result = await fetch("/api/newMedicine?minqty=1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          godownMinQty: minQty,
          sectionType,
        }),
      });
      result = await result.json();
      if (result.success) {
        const updatedMedicines = filteredMedicines.map((medicine) =>
          medicine._id === id
            ? {
                ...medicine,
                minimumStockCount: {
                  ...medicine.minimumStockCount,
                  godown: minQty,
                },
              }
            : medicine
        );
        setFilteredMedicines(updatedMedicines);
        setMinQty("");
      } else showError(result.message);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-2 w-full md:w-4/5 lg:w-3/4 mx-auto text-gray-900">
      <div className="flex items-center gap-1 w-full">
        <div className="flex-1 rounded-full bg-gray-900 p-2 flex font-semibold text-gray-100 justify-around items-center">
          <div className="w-2/5">Name</div>
          <div className="w-2/5">Stock</div>
        </div>
        <button
          onClick={() => setOnlyInStock(!onlyInStock)}
          className={
            "rounded-full  py-2 px-4 font-semibold text-gray-100 " +
            (onlyInStock ? "bg-blue-700" : "bg-gray-900")
          }
        >
          {">1"}
        </button>
      </div>
      {filteredMedicines ? (
        filteredMedicines.map((medicine, index) => {
          console.log(filteredMedicines);
          let totalStrips = medicine.stocks.reduce(
            (acc, stock) => acc + stock.quantity.totalStrips,
            0
          );
          let totalBoxes = medicine.stocks.reduce(
            (acc, stock) => acc + stock.quantity.boxes,
            0
          );
          let totalExtra = medicine.stocks.reduce(
            (acc, stock) => acc + stock.quantity.extra,
            0
          );
          return (
            <div className="w-full" key={index}>
              <div
                onClick={() =>
                  setSelectedIndex(selectedIndex === index ? null : index)
                }
                className="w-full hover:cursor-pointer rounded-full font-medium bg-gray-300 hover:bg-gray-400 p-2 flex items-center my-1"
              >
                <div className="w-[45%] px-3">{medicine.name}</div>
                <div className="w-[45%] text-center text-sm">
                  {medicine.stocks.length > 0
                    ? "Total Strips: " +
                      totalStrips +
                      " = Boxes: " +
                      totalBoxes +
                      ", Extra: " +
                      totalExtra
                    : "--"}
                </div>
                {medicine.minimumStockCount?.godown !== undefined ? (
                  totalStrips < medicine.minimumStockCount?.godown && (
                    <TiWarning className="text-red-900 size-6 animate-pulse" />
                  )
                ) : (
                  <FaSquarePen className="text-red-900 size-6 animate-pulse" />
                )}

                {medicine.requests.length > 0 && (
                  <ImBoxRemove className="text-red-900 text-lg" />
                )}
              </div>
              {selectedIndex === index && (
                <div className="w-full bg-slate-200 p-2 rounded-xl">
                  <div className="flex flex-wrap gap-x-4 justify-around border-b-2 border-gray-400 py-2">
                    <div className="py-1 px-4 ">
                      Manufacturer:{" "}
                      <span className="text-blue-500 font-semibold">
                        {medicine.manufacturer?.name}
                      </span>
                    </div>
                    <div className="py-1 px-4 ">
                      Salts:{" "}
                      <span className="text-blue-500 font-semibold">
                        {medicine.salts[0]?.name}
                      </span>
                    </div>
                    <div className="py-1 px-4 ">
                      Pack:{" "}
                      <span className="text-blue-500 font-semibold">
                        {medicine.packetSize?.strips}
                      </span>
                    </div>
                    <div className="py-1 px-4 ">
                      Tablets per strip:{" "}
                      <span className="text-blue-500 font-semibold">
                        {medicine.packetSize?.tabletsPerStrip}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center items-center gap-2 mt-2">
                    {medicine.minimumStockCount &&
                    medicine.minimumStockCount.godown !== null ? (
                      <>
                        <div className="font-semibold text-gray-600 bg-slate-300 px-2 rounded">
                          Min Stock Qty:{" "}
                          <span className="text-black">
                            {medicine.minimumStockCount.godown}
                          </span>
                        </div>
                        <div
                          className="text-red-700 bg-red-200 p-1 rounded-md hover:text-red-800 cursor-pointer"
                          onClick={() => {
                            setFilteredMedicines((prevMedicines) =>
                              prevMedicines.map((med) =>
                                med._id === medicine._id
                                  ? {
                                      ...med,
                                      minimumStockCount: {
                                        ...med.minimumStockCount,
                                        godown: null,
                                      },
                                    }
                                  : med
                              )
                            );
                          }}
                        >
                          <IoIosRemoveCircle className="size-4" />
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          value={minQty}
                          min={0}
                          onChange={(e) => {
                            setMinQty(e.target.value);
                          }}
                          placeholder="Set Min Stock Qty"
                          className="rounded-lg py-1 px-2 bg-slate-300 text-black outline-none"
                        />
                        <button
                          className="rounded-lg px-3 py-1 text-white font-semibold bg-slate-700 hover:bg-slate-600"
                          onClick={() => {
                            handleSetMinQty(medicine._id);
                          }}
                          disabled={submitting}
                        >
                          {submitting ? "Wait..." : "Set"}
                        </button>
                      </>
                    )}
                    {medicine.maximumStockCount &&
                    medicine.maximumStockCount.godown !== null ? (
                      <>
                        <div className="font-semibold text-gray-600 bg-slate-300 px-2 rounded">
                          Max Stock Qty:{" "}
                          <span className="text-black">
                            {medicine.maximumStockCount.godown}
                          </span>
                        </div>
                        <div
                          className="text-red-700 bg-red-200 p-1 rounded-md hover:text-red-800 cursor-pointer"
                          onClick={() => {
                            setFilteredMedicines((prevMedicines) =>
                              prevMedicines.map((med) =>
                                med._id === medicine._id
                                  ? {
                                      ...med,
                                      maximumStockCount: {
                                        ...med.maximumStockCount,
                                        godown: null,
                                      },
                                    }
                                  : med
                              )
                            );
                          }}
                        >
                          <IoIosRemoveCircle className="size-4" />
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          value={maxQty}
                          min={0}
                          onChange={(e) => {
                            setMaxQty(e.target.value);
                          }}
                          placeholder="Set Max Stock Qty"
                          className="rounded-lg py-1 px-2 bg-slate-300 text-black outline-none"
                        />
                        <button
                          className="rounded-lg px-3 py-1 text-white font-semibold bg-slate-700 hover:bg-slate-600"
                          onClick={() => {
                            handleSetMaxQty(medicine._id);
                          }}
                          disabled={submitting}
                        >
                          {submitting ? "Wait..." : "Set"}
                        </button>
                      </>
                    )}
                  </div>
                  <div className="py-1 max-h-48 overflow-y-auto">
                    {medicine.stocks.map((stock, it) => (
                      <div
                        key={it}
                        className="w-full rounded-xl my-1 bg-gray-300 p-2 "
                      >
                        <div className="flex justify-around items-center">
                          <div className="w-[10%]">{stock.batchName}</div>
                          <div className="w-1/5">
                            {"Expiry: " + stock.expiryDate.split("T")[0]}
                          </div>
                          <div className="w-[25%]">
                            {stock.quantity.boxes +
                              " Boxes " +
                              (stock.quantity.extra
                                ? stock.quantity.extra + " Extra "
                                : "") +
                              stock.quantity.totalStrips +
                              " Strips"}
                          </div>
                          <div className="w-[10%]">
                            {"P: " + stock.purchasePrice}
                          </div>
                          <div className="w-[10%]">
                            {"S: " + stock.sellingPrice}
                          </div>
                          <div className="w-1/5">
                            {"Mfg: " +
                              (stock.mfgDate
                                ? stock.mfgDate.split("T")[0]
                                : "Not set")}
                          </div>
                        </div>
                        <div className="text-sm text-center text-gray-500 font-semibold">
                          {"Stock Added on: " + stock.createdAt.split("T")[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="w-full p-4 flex flex-col justify-center items-center text-2xl font-semibold text-gray-400">
          <BiInjection size={60} />
          <div>No Medicine</div>
        </div>
      )}
    </div>
  );
}

export default GodownStock;
