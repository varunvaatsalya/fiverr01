"use client";
import React, { useEffect, useState } from "react";
import { ImBoxRemove } from "react-icons/im";
import { BiInjection } from "react-icons/bi";

function GodownStock({ medicineStock, query }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [filteredMedicines, setFilteredMedicines] = useState(
    medicineStock?.medicines
  );
  useEffect(() => {
    setFilteredMedicines(medicineStock?.medicines);
  }, [medicineStock]);
  useEffect(() => {
    if (query) {
      setFilteredMedicines(
        medicineStock?.medicines.filter((medicine) =>
          medicine.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      setFilteredMedicines(medicineStock?.medicines);
    }
  }, [query]);
  return (
    <div className="p-2 w-full md:w-4/5 lg:w-3/4 mx-auto text-gray-900">
      <div className="w-full rounded-full bg-gray-900 p-2 flex font-semibold text-gray-100 justify-around items-center">
        <div className="w-2/5">Name</div>
        <div className="w-2/5">Stock</div>
      </div>
      {filteredMedicines ? (
        filteredMedicines.map((medicine, index) => (
          <>
            <div
              key={medicine._id}
              onClick={() =>
                setSelectedIndex(selectedIndex === index ? null : index)
              }
              className="w-full hover:cursor-pointer rounded-full font-medium bg-gray-300 hover:bg-gray-400 p-2 flex justify-around items-center"
            >
              <div className="w-2/5">{medicine.name}</div>
              <div className="w-2/5">
                {"Boxes: " +
                  medicine.stocks.reduce(
                    (acc, stock) => acc + stock.quantity.boxes,
                    0
                  ) +
                  " Strips: " +
                  medicine.stocks.reduce(
                    (acc, stock) => acc + stock.quantity.totalStrips,
                    0
                  )}
              </div>
              {medicine.requests.length ? (
                <div className="text-red-900 text-lg">
                  <ImBoxRemove />
                </div>
              ) : (
                <></>
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
                    Strips:{" "}
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
                {medicine.stocks.map((stock) => (
                  <div className="w-full rounded-full bg-gray-300 p-2 flex justify-around items-center">
                    <div className="w-1/5">{stock.batchName}</div>
                    <div className="w-1/5">
                      {"Expiry: " + stock.expiryDate.split("T")[0]}
                    </div>
                    <div className="w-1/5">
                      {stock.quantity.boxes +
                        " Boxes " +
                        (stock.quantity.extra
                          ? stock.quantity.extra + " Extra"
                          : "") +
                        stock.quantity.totalStrips +
                        " Strips"}
                    </div>
                    <div className="w-[15%]">{"P: " + stock.purchasePrice}</div>
                    <div className="w-[15%]">{"S: " + stock.sellingPrice}</div>
                    <div className="w-1/5">
                      {"Date: " + stock.createdAt.split("T")[0]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ))
      ) : (
        <div className="w-full p-4 flex flex-col justify-center items-center text-2xl font-semibold text-gray-400">
          <BiInjection size={60}/>
          <div>No Medicine</div>
        </div>
      )}
    </div>
  );
}

export default GodownStock;
