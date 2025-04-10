"use client";
import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { formatDateTimeToIST, formatDateToIST } from "../utils/date";

function ReturnInvoice({
  returnInvoice,
  setReturnInvoice,
  setInvoices,
  accessInfo,
}) {
  const [returnMedicineDetails, setReturnMedicineDetails] = useState({});
  const [openReturnInvoiceIndex, setOpenReturnInvoiceIndex] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

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
    setSubmitting(true);
    try {
      const response = await fetch("/api/newPharmacyInvoice/returnInvoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: returnInvoice._id,
          returnMedicineDetails,
        }),
      });
      const result = await response.json();
      setMessage(result.message);
      console.log(result);
      if (result.success) {
        setInvoices((prevInvoices) =>
          prevInvoices.map((invoice) =>
            invoice._id === returnInvoice._id ? result.invoice : invoice
          )
        );
        setTimeout(() => {
          setReturnInvoice(null);
        }, 2500);
      }
    } catch (error) {
      console.error("Error while saving return invoice", error);
    }
    setSubmitting(false);
  }

  async function handleGetPaid(returnId, totalPrice) {
    setSubmitting(true);
    const isConfirmed = confirm(
      `Have You paid Rs.${totalPrice} to ${returnInvoice.patientId?.name} and want to mark this return invoice as paid?`
    );
    if (!isConfirmed) {
      setSubmitting(false);
      return;
    }
    try {
      const response = await fetch("/api/newPharmacyInvoice/returnInvoice", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: returnInvoice._id,
          returnId,
        }),
      });
      const result = await response.json();
      setMessage(result.message);
      console.log(result);
      if (result.success) {
        setInvoices((prevInvoices) =>
          prevInvoices.map((invoice) =>
            invoice._id === returnInvoice._id ? result.invoice : invoice
          )
        );
        setTimeout(() => {
          setReturnInvoice(null);
        }, 2500);
      }
    } catch (error) {
      console.error("Error while saving return invoice", error);
    }
    setSubmitting(false);
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
      {message && (
        <div className="text-center text-red-600 font-semibold">{message}</div>
      )}
      <div className="flex items-center justify-around">
        <div className="">
          Patient Name:{" "}
          <span className="text-blue-600">{returnInvoice.patientId?.name}</span>
        </div>
        <div className="">
          Invoice Id:{" "}
          <span className="text-blue-600">{returnInvoice.inid}</span>
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
        <>
          <div className="my-1 bg-gray-700 text-gray-300 rounded-lg flex flex-wrap items-center justify-around gap-1 font-semibold text-sm py-1 px-2">
            <div className="w-12 text-center">Sr No.</div>
            <div className="flex-1 min-w-28 text-center">Return ID</div>
            <div className="flex-1 min-w-28 text-center">Date</div>
            <div className="flex-1 min-w-28 text-center">Price</div>
            <div className="flex-1 min-w-28 text-center">Paid</div>
            <div className="flex-1 min-w-28 text-center"></div>
          </div>
          <div className="space-y-1">
            {returnInvoice.returns.map((invoice, index) => {
              let totalPrice = invoice.medicines.reduce((total, medicine) => {
                return (
                  total +
                  medicine.returnStock.reduce((stockTotal, stock) => {
                    const price = stock.price || 0;
                    return stockTotal + price;
                  }, 0)
                );
              }, 0);
              return (
                <div key={index}>
                  <div
                    onClick={() =>
                      setOpenReturnInvoiceIndex((prev) =>
                        prev === index ? null : index
                      )
                    }
                    className="bg-gray-800 hover:bg-slate-800 cursor-pointer text-gray-300 rounded-lg flex flex-wrap items-center justify-around gap-1 font-semibold text-sm py-1 px-2"
                  >
                    <div className="w-12 text-center">{index + 1 + "."}</div>
                    <div className="flex-1 min-w-28 text-center">
                      {invoice.returnId}
                    </div>
                    <div className="flex-1 min-w-28 text-center uppercase">
                      {formatDateTimeToIST(invoice.createdAt)}
                    </div>
                    <div className="flex-1 min-w-28 text-center">
                      {totalPrice}
                    </div>
                    <div className="flex-1 min-w-28 text-center">
                      {returnInvoice.paymentMode.startsWith("Credit") ? (
                        "Credit Invoice"
                      ) : invoice.isReturnAmtPaid ? (
                        <span className="uppercase">
                          {formatDateTimeToIST(invoice.isReturnAmtPaid)}
                        </span>
                      ) : accessInfo.accessRole === "salesman" ||
                        accessInfo.accessRole === "admin" ? (
                        <button
                          onClick={() => {
                            handleGetPaid(invoice.returnId, totalPrice);
                          }}
                          disabled={submitting}
                          className="rounded px-2 bg-green-600"
                        >
                          {submitting ? "Wait..." : "Pay"}
                        </button>
                      ) : (
                        "Not Paid"
                      )}
                    </div>
                    <div className="flex-1 min-w-28 flex justify-center">
                      {!invoice.isReturnAmtPaid &&
                      (accessInfo.accessRole === "dispenser" ||
                        accessInfo.accessRole === "admin") ? (
                        <button className="rounded px-2 bg-blue-600">
                          Print
                        </button>
                      ) : (
                        "--"
                      )}
                    </div>
                  </div>
                  {openReturnInvoiceIndex === index && (
                    <div className="bg-gray-700 text-gray-300 rounded-lg flex flex-wrap items-center justify-around gap-1 font-semibold text-sm py-1 px-2">
                      <div className="w-full bg-gray-800 text-gray-300 rounded-lg flex flex-wrap items-center justify-around gap-1 font-semibold text-sm py-1 px-2">
                        <div className="flex-1 min-w-28 text-center">Batch</div>
                        <div className="flex-1 min-w-28 text-center">
                          Expiry
                        </div>
                        <div className="flex-1 min-w-28 text-center">
                          Return Qty
                        </div>
                        <div className="flex-1 min-w-28 text-center">MRP</div>
                        <div className="flex-1 min-w-28 text-center">Price</div>
                      </div>
                      {invoice.medicines.map((medicine) => (
                        <div key={medicine.medicineId} className="bg-gray-700 rounded-lg w-full border-b border-gray-900">
                          <div className="text-sm">
                            Medicines Name:{" "}
                            <span className="text-blue-400">
                              {
                                returnInvoice.medicines.find(
                                  (med) =>
                                    med.medicineId._id === medicine.medicineId
                                ).medicineId.name
                              }
                            </span>
                          </div>

                          {medicine.returnStock.map((batch, batchIndex) => (
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
                                {batch.quantity.strips + " Strips"}
                                {batch.quantity.tablets > 0 && (
                                  <span>
                                    {" "}
                                    + {batch.quantity.tablets} Tablets
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-28 text-center">
                                {batch.sellingPrice}
                              </div>

                              <div className="flex-1 min-w-28 text-center">
                                {batch.price}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center font-semibold text-gray-600">
          No return record found!
        </div>
      )}
      {(accessInfo.accessRole === "dispenser" ||
        accessInfo.accessRole === "admin") && (
        <>
          <hr className="my-2 border-t border-gray-700" />
          <div className=" text-center font-semibold">
            Create Return Invoice
          </div>
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
                                  medicine.medicineId._id,
                                  batchIndex,
                                  "tabletsPerStrip",
                                  e.target.value
                                );
                              }}
                              placeholder="Tablets per Strips"
                              className="px-2 rounded w-full bg-gray-700 min-w-28"
                            />
                          ) : medicine.medicineId.isTablets ? (
                            batch.packetSize?.tabletsPerStrip
                          ) : (
                            "--"
                          )}
                        </div>
                        <div className="flex-1 min-w-28 flex gap-1">
                          <input
                            type="number"
                            onChange={(e) => {
                              handleStockChange(
                                medicine.medicineId._id,
                                batchIndex,
                                "strips",
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
                                  medicine.medicineId._id,
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
            disabled={
              Object.keys(returnMedicineDetails).length === 0 || submitting
            }
            onClick={handleSave}
            className="px-3 py-2 font-semibold disabled:bg-gray-700 bg-green-600 text-white rounded-lg"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </>
      )}
    </div>
  );
}

export default ReturnInvoice;
