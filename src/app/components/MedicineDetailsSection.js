"use client";
import React, { useState } from "react";
import { FaCircleDot } from "react-icons/fa6";
import { formatDateTimeToIST } from "../utils/date";
import Loading from "./Loading";

function MedicineDetailsSection({
  medicineDetails,
  setMedicineDetails,
  setMedicineDetailsSection,
  setInvoices,
  deliveredButton = false,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleDelivered(id) {
    setSubmitting(true);
    try {
      let result = await fetch(`/api/newPharmacyInvoice`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      result = await result.json();
      if (result.success) {
        setInvoices((prev) => prev.filter((invoice) => invoice._id !== id));
        setTimeout(() => {
          setMedicineDetailsSection(false);
          setMedicineDetails(false);
        }, 2500);
      }
      setMessage(result.message);
    } catch (error) {
      console.error("Error deleting admin:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="absolute top-0 left-0">
      <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
        <div className="w-[95%] md:w-4/5 lg:w-3/4 text-center bg-slate-950 rounded-xl">
          <div className="text-center py-2 rounded-t-xl bg-slate-900 text-xl text-white font-semibold">
            Medicine Details
          </div>
          {message && (
            <div className="my-1 text-center text-red-500">{message}</div>
          )}
          <div className="px-2">
            <div className="flex flex-wrap justify-around items-center p-2 text-white">
              <div className="py-1 px-4 ">
                Name:{" "}
                <span className="text-blue-500 font-semibold">
                  {medicineDetails.patientId?.name}
                </span>
              </div>
              <div className="py-1 px-4 ">
                UHID:{" "}
                <span className="text-blue-500 font-semibold">
                  {medicineDetails.patientId?.uhid}
                </span>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto flex flex-col gap-2">
              {medicineDetails.medicines.length > 0 ? (
                medicineDetails.medicines.map((medicine) => (
                  <div key={medicine._id} className="w-full rounded-lg border border-gray-700">
                    <div className="p-1 border-b border-gray-700 text-white">
                      <div className="flex justify-around items-center">
                        <div className="px-3 flex items-center">
                          {medicine.status && (
                            <FaCircleDot
                              className={`w-[5%] min-w-10 ${
                                medicine.status === "Fulfilled"
                                  ? "text-green-500"
                                  : medicine.status === "Insufficient Stock"
                                  ? "text-yellow-500"
                                  : "text-red-500"
                              }`}
                            />
                          )}
                          <div className="mr-1">Medicine:</div>
                          <span className="text-blue-500 font-semibold">
                            {medicine.medicineId.name}
                          </span>
                        </div>
                        <div className="px-3 ">
                          Place:{" "}
                          <span className="text-blue-500 font-semibold">
                            {medicine.medicineId.rackPlace
                              ? medicine.medicineId.rackPlace.retails
                              : "N/A"}
                          </span>
                        </div>
                        {medicine.medicineId.isTablets && (
                          <div className="px-3 ">
                            Strip Size:{" "}
                            <span className="text-blue-500 font-semibold">
                              {medicine.medicineId.packetSize.tabletsPerStrip +
                                " Tablets/Strip"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="px-2 py-1">
                      {medicine.allocatedStock.length > 0 ? (
                        <>
                          <div className="mb-1 flex flex-wrap items-center bg-gray-700 rounded-lg  text-sm text-white">
                            <div className="w-[15%] min-w-24">Batch</div>
                            <div className="w-[25%] min-w-48">Expiry Date</div>
                            <div className="w-[20%] min-w-36">Quantity</div>
                            <div className="w-[15%] min-w-16">MRP</div>
                            <div className="w-[15%] min-w-20">Subtotal</div>
                          </div>
                          {medicine.allocatedStock.map((stock) => (
                            <div
                              key={stock._id}
                              className="flex flex-wrap items-center bg-gray-800 rounded-lg text-sm text-white"
                            >
                              <div className="w-[15%] min-w-24">
                                {stock.batchName}
                              </div>
                              <div className="w-[25%] min-w-48 uppercase">
                                {formatDateTimeToIST(stock.expiryDate)}
                              </div>
                              <div className="w-[20%] min-w-36">
                                {
                                  <>
                                    {stock.quantity.strips > 0 &&
                                      stock.quantity.strips +
                                        (medicine.medicineId.isTablets
                                          ? " Strips"
                                          : " Pcs")}
                                    {stock.quantity.strips > 0 &&
                                      stock.quantity.tablets > 0 &&
                                      ", "}
                                    {stock.quantity.tablets > 0
                                      ? stock.quantity.tablets + " Tablets"
                                      : ""}
                                  </>
                                }
                              </div>
                              <div className="w-[15%] min-w-16">
                                {stock.sellingPrice}
                              </div>
                              <div className="w-[15%] min-w-20">
                                {parseFloat(
                                  (
                                    stock.quantity.strips * stock.sellingPrice +
                                    stock.quantity.tablets *
                                      (stock.sellingPrice /
                                        medicine.medicineId.packetSize
                                          .tabletsPerStrip)
                                  ).toFixed(2)
                                )}
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="text-center">No Stock Available</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 font-semibold text-lg">
                  *No Medicine Records
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-gray-700 py-1 flex justify-end gap-2 mt-2 pr-4 text-blue-500">
            <div className="flex justify-end gap-3 items-center px-2 text-md">
              <div className="font-semibold text-center">Total:</div>
              <div className="text-white">
                {medicineDetails.price.subtotal + "/-"}
              </div>
            </div>
            <div className="flex justify-end gap-3 items-center px-2 text-md">
              <div className="font-semibold text-center">Discount:</div>
              <div className="text-white">
                {medicineDetails.price.discount
                  ? medicineDetails.price.discount + "%"
                  : "--"}
              </div>
            </div>
            <div className="flex justify-end gap-3 items-center px-2 text-md">
              <div className="font-semibold text-center">Grand Total:</div>
              <div className="text-white">
                {medicineDetails.price.total + "/-"}
              </div>
            </div>
          </div>
          <hr className="border-t border-slate-900 w-full my-2" />
          <div className="flex px-4 gap-3 my-3 justify-end">
            <div
              className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
              onClick={() => {
                setMedicineDetailsSection(false);
                setMedicineDetails(false);
              }}
            >
              Cancel
            </div>
            {!medicineDetails.isDelivered && deliveredButton && (
              <button
                onClick={() => {
                  handleDelivered(medicineDetails._id);
                }}
                className="w-20 h-8 py-1 flex items-center justify-center gap-2 rounded-lg font-semibold bg-green-500 text-white disabled:bg-gray-600"
                disabled={submitting}
              >
                {submitting ? <Loading size={15} /> : <></>}
                {submitting ? "Wait..." : "Confirm"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicineDetailsSection;
