"use client";
import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { formatDateToIST } from "../utils/date";

function ReturnInvoice({ returnInvoice, setReturnInvoice }) {
  const [returnMedicineDetails, setReturnMedicineDetails] = useState({});

  const handleStockChange = (medicineId, stockIndex, field, value) => {
    setReturnMedicineDetails((prevDetails) => {
      let updatedMedicine = {
        ...prevDetails[medicineId],
        [stockIndex]: {
          ...(prevDetails[medicineId]?.[stockIndex] || {}),
          [field]: value,
        },
      };

      // Remove keys with value ""
      updatedMedicine[stockIndex] = Object.fromEntries(
        Object.entries(updatedMedicine[stockIndex]).filter(
          ([key, val]) => val !== ""
        )
      );

      // Remove stockIndex if empty after cleanup
      if (Object.keys(updatedMedicine[stockIndex]).length === 0) {
        delete updatedMedicine[stockIndex];
      }

      // Remove medicineId if no stockIndex is left
      if (Object.keys(updatedMedicine).length === 0) {
        const { [medicineId]: _, ...remainingDetails } = prevDetails;
        return remainingDetails;
      }

      return {
        ...prevDetails,
        [medicineId]: updatedMedicine,
      };
    });
  };

  async function handleSave() {
    try {
      const response = await fetch("/api/newPharmacyInvoice/returnInvoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          returnInvoiceId: returnInvoice._id,
          returnMedicineDetails,
        }),
      });
      const data = await response.json();
      if (data.success) {
        // setReturnInvoice(null);
        console.log(data);
      } else {
        console.error(data.message);
      }
    } catch {
      console.error("Error while saving return invoice", error);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-950 text-white px-2">
      <div className="flex items-center gap-2 p-2">
        <button
          onClick={() => {
            setReturnInvoice(null);
          }}
          className="p-2 rounded-full hover:bg-slate-900"
        >
          <FaArrowLeft className="size-5" />
        </button>
        <div className="font-semibold text-lg">
          Pharmcy Invoice Return Details
        </div>
      </div>
      <div className="flex items-center">
        <div className="">
          Patient Name:{" "}
          <span className="text-blue-600">{returnInvoice.patientId?.name}</span>
        </div>
      </div>
      <hr
        onClick={() => {
          console.log(returnMedicineDetails);
        }}
        className="my-2 border-t border-gray-700"
      />
      <div className=" text-center font-semibold">Return History</div>
      {returnInvoice.returns ? (
        <></>
      ) : (
        <div className="text-center font-semibold text-gray-600">
          No return record found!
        </div>
      )}
      <hr className="my-2 border-t border-gray-700" />
      <div className="bg-gray-700 text-gray-300 rounded-lg flex flex-wrap items-center justify-around gap-1 font-semibold text-sm py-1 px-2">
        <div className="flex-1 min-w-28 text-center">Batch</div>
        <div className="flex-1 min-w-28 text-center">Expiry</div>
        <div className="flex-1 min-w-28 text-center">Qty/Strps</div>
        <div className="flex-1 min-w-28 text-center">Tablets</div>
        <div className="flex-1 min-w-28 text-center">MRP</div>
        <div className="flex-1 min-w-28 text-center">Tblts/Strps</div>
        <div className="flex-1 min-w-28 text-center">Return Qty</div>
      </div>
      <div className="max-h-80 py-1 overflow-y-auto">
        {returnInvoice.medicines.length > 0 ? (
          returnInvoice.medicines.map((medicine) => {
            return (
              <div
                key={medicine._id}
                className=" bg-gray-800 text-gray-300 rounded-lg font-semibold text-sm py-1"
              >
                <div className=" font-semibold text-blue-600 px-4 py-1">
                  {medicine.medicineId.name}
                </div>
                {medicine.allocatedStock.map((batch, batchIndex) => (
                  <div
                    key={batchIndex}
                    className="flex flex-wrap items-center justify-around gap-1 font-semibold text-sm py-1 px-2"
                  >
                    <div className="flex-1 min-w-28 text-center">
                      {batch.batchName}
                    </div>
                    <div className="flex-1 min-w-28 text-center">
                      {formatDateToIST(batch.expiryDate)}
                    </div>
                    <div className="flex-1 min-w-28 text-center">
                      {batch.quantity.strips}
                    </div>
                    <div className="flex-1 min-w-28 text-center">
                      {medicine.medicineId.isTablets
                        ? batch.quantity.tablets
                        : "--"}
                    </div>
                    <div className="flex-1 min-w-28 text-center">
                      {batch.sellingPrice}
                    </div>
                    <div className="flex-1 min-w-28 text-center">
                      {!batch.packetSize?.tabletsPerStrip &&
                      medicine.medicineId.isTablets ? (
                        <input
                          type="number"
                          onChange={(e) => {
                            handleStockChange(
                              medicine._id,
                              batchIndex,
                              "tabletsPerStrip",
                              e.target.value
                            );
                          }}
                          placeholder="Tablets per Strips"
                          className="px-2 rounded w-full bg-gray-700 min-w-28"
                        />
                      ) : (
                        "--"
                      )}
                    </div>
                    <div className="flex-1 min-w-28 flex gap-1">
                      <input
                        type="number"
                        onChange={(e) => {
                          handleStockChange(
                            medicine._id,
                            batchIndex,
                            "returnStrips",
                            e.target.value
                          );
                        }}
                        placeholder="Qty or Strps"
                        className="px-1 rounded w-full bg-gray-700"
                      />
                      {medicine.medicineId.isTablets && (
                        <input
                          type="number"
                          onChange={(e) => {
                            handleStockChange(
                              medicine._id,
                              batchIndex,
                              "tablets",
                              e.target.value
                            );
                          }}
                          placeholder="Tablets"
                          className="px-2 rounded w-full bg-gray-700"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        ) : (
          <div className="text-center text-red-600 font-semibold">
            No medicines has been sold in this returnInvoice
          </div>
        )}
      </div>
      <button
        disabled={Object.keys(returnMedicineDetails).length === 0}
        onClick={() => {
          handleSave;
        }}
        className="px-3 py-2 font-semibold disabled:bg-gray-700 bg-green-600 text-white rounded-lg"
      >
        Submit
      </button>
    </div>
  );
}

export default ReturnInvoice;
