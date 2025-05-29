"use client";
import React, { useState } from "react";
import Loading from "./Loading";
import { showError, showSuccess } from "../utils/toast";

function NewPharmacyInvoiceBackDate({
  isAddInfoOpen,
  setIsAddInfoOpen,
  selectedPatient,
  setNewInvoiceSection,
  setPrintInvoice,
}) {
  const [createdAt, setCreatedAt] = useState("");
  const [discount, setDiscount] = useState("");
  const [selectedPaymentMode] = useState("Credit-Insurance");
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (index, field, value) => {
    setIsAddInfoOpen((prev) => {
      const updated = [...prev];
      const item = updated[index];

      // Update the current field
      item[field] = value;

      // If field is 'mrp', recalculate the price
      if (field === "mrp") {
        const med = item;
        const mrp = parseFloat(value) || 0;

        let total = 0;
        if (med.medicine?.isTablets) {
          const strips = med.quantity?.strips || 0;
          const tablets = med.quantity?.tablets || 0;
          const tabletsPerStrip =
            med.medicine?.packetSize?.tabletsPerStrip || 1;

          total = strips * mrp + (tablets * mrp) / tabletsPerStrip;
        } else {
          const qty = med.quantity?.normalQuantity || 0;
          total = qty * mrp;
        }

        item.price = parseFloat(total.toFixed(2)); // round to 2 decimals
      }

      updated[index] = { ...item };
      return updated;
    });
  };

  function getGrandTotal() {
    const grandTotal = isAddInfoOpen.reduce((grandTotal, medicine) => {
      return grandTotal + (medicine.price || 0);
    }, 0);
    return parseFloat(grandTotal.toFixed(2));
  }

  function getDiscountedTotal() {
    if (!discount || discount < 0 || discount > 5) return getGrandTotal();

    let grandTotal = getGrandTotal();
    grandTotal = (grandTotal * (100 - discount)) / 100;

    return parseFloat(grandTotal.toFixed(2));
  }

  const onSubmit = async () => {
    if (submitting || !selectedPatient || !discount || !createdAt) return;
    try {
      const data = isAddInfoOpen.map((med) => {
        let batch = med.batch || "";
        let expiry = med.expiry || "";
        let purchasePrice = parseFloat((med.purchasePrice || 0).toFixed(2));
        let mrp = parseFloat((med.mrp || 0).toFixed(2));

        if (!batch || !expiry || !purchasePrice || !mrp) {
          throw new Error(`Set the all details in : ${med.medicine.name}`);
        }

        return {
          medicine: med.medicine,
          quantity: med.quantity,
          batch,
          expiry,
          purchasePrice,
          mrp,
        };
      });
      setSubmitting(true);
      console.log(data)
      try {
        let result = await fetch("/api/newPharmacyInvoice/backDateInvoice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            medicines: data,
            selectedPatient,
            createdAt,
            discount: parseFloat(discount),
            selectedPaymentMode,
          }),
        });
        result = await result.json();
        if (result.success) {
          showSuccess(result.message, { position: "top-right" });
          setDiscount("");
          setPrintInvoice(result.invoice);
          setTimeout(() => {
            if (setNewInvoiceSection) {
              setIsAddInfoOpen(null);
              setNewInvoiceSection(false);
            }
          }, 1000);
        } else {
          showError(result.message);
        }
      } catch (error) {
        showError("Error in submitting application");
        console.error("Error submitting application:", error);
      }
      setSubmitting(false);
    } catch (error) {
      showError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="absolute top-0 left-0">
      <div className="fixed w-screen h-screen bg-gray-800/[.8] z-30 flex justify-center items-center">
        <div className="w-[95%] md:w-4/5 text-center bg-slate-950 p-2 rounded-xl">
          <div className="w-full flex flex-col items-center max-h-[90vh] overflow-y-auto">
            <div className="text-center py-2 text-xl text-white font-semibold">
              Custom Invoice
            </div>
            <hr className="w-4/5 border-t border-gray-500" />
            <div className="w-full flex flex-wrap justify-around gap-2 my-1 text-gray-200">
              <div className="font-semibold">
                Pateint:{" "}
                <span className="text-blue-500 uppercase">
                  {selectedPatient?.name}
                </span>
              </div>
              <div className="font-semibold">
                UHID:{" "}
                <span className="text-blue-500 uppercase">
                  {selectedPatient?.uhid}
                </span>
              </div>
            </div>
            <label htmlFor="createdAt" className="text-gray-200 my-2 text-sm">
              Created date
              <input
                type="datetime-local"
                name="createdAt"
                id="createdAt"
                value={createdAt}
                onChange={(e) => {
                  setCreatedAt(e.target.value);
                }}
                className="px-2 py-1 mx-2 bg-gray-800 text-gray-300 outline-none rounded-lg"
              />
            </label>

            <div className="w-full flex flex-wrap items-center justify-between px-2 pb-1 gap-1 text-sm font-semibold text-gray-200 border-b border-gray-700">
              <div className="w-1/5 px-1 text-start">Medicine</div>
              <div className="flex-1 px-1 text-center">Packet Size</div>
              <div className="flex-1 px-1 text-center">Batch</div>
              <div className="flex-1 px-1 text-center">Expiry</div>
              <div className="flex-1 px-1">P.Price</div>
              <div className="flex-1 px-1">MRP</div>
              <div className="flex-1 px-1 text-start">Qty</div>
              <div className="flex-1 px-1 text-end">Total</div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto space-y-1 py-1 w-full">
              {isAddInfoOpen.map((med, it) => {
                return (
                  <div
                    key={it}
                    className="w-full flex flex-wrap items-center justify-between gap-1 px-2 text-sm text-gray-300"
                  >
                    <div
                      title={med.medicine.name}
                      className="w-1/5 line-clamp-1 text-start"
                    >
                      {med.medicine.name}
                    </div>
                    <div className="flex-1 text-center min-w-28">
                      {med.medicine?.isTablets
                        ? `${med.medicine?.packetSize?.strips} Strps, ${med.medicine?.packetSize?.tabletsPerStrip} Tabs`
                        : `${med.medicine?.packetSize?.strips} Pcs`}
                    </div>
                    <div className="flex-1 min-w-28">
                      <input
                        type="text"
                        className="w-full bg-gray-800 p-1 rounded"
                        placeholder="Batch"
                        value={med.batch || ""}
                        onChange={(e) =>
                          handleInputChange(it, "batch", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-28">
                      <input
                        type="date"
                        className="w-full bg-gray-800 p-1 rounded"
                        value={med.expiry || ""}
                        onChange={(e) =>
                          handleInputChange(it, "expiry", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-28">
                      <input
                        type="number"
                        className="w-full bg-gray-800 p-1 rounded"
                        placeholder="P.Price"
                        value={med.purchasePrice || ""}
                        onChange={(e) =>
                          handleInputChange(
                            it,
                            "purchasePrice",
                            parseFloat(e.target.value || 0)
                          )
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-28">
                      <input
                        type="number"
                        className="w-full bg-gray-800 p-1 rounded"
                        placeholder="MRP"
                        value={med.mrp || ""}
                        onChange={(e) =>
                          handleInputChange(
                            it,
                            "mrp",
                            parseFloat(e.target.value || 0)
                          )
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-28 text-start text-gray-300 px-2">
                      {med.medicine?.isTablets ? (
                        <>
                          {med.quantity.strips > 0 &&
                            med.quantity.strips + " Strips"}
                          {med.quantity.strips > 0 &&
                            med.quantity.tablets > 0 &&
                            ", "}
                          {med.quantity.tablets > 0
                            ? med.quantity.tablets + " Tablets"
                            : ""}
                        </>
                      ) : (
                        <>{med.quantity.normalQuantity + " Pcs"}</>
                      )}
                    </div>
                    {
                      <div className="flex-1 min-w-28 text-end font-semibold">
                        {med?.mrp && med.price ? (
                          <span>{parseFloat(med.price.toFixed(2)) + "/-"}</span>
                        ) : (
                          "--"
                        )}
                      </div>
                    }
                  </div>
                );
              })}
            </div>
            <div className="w-full border-t border-gray-700 py-1 text-white">
              <div className="flex justify-end gap-3 items-center px-2 text-md">
                <div className="font-semibold text-center text-blue-500">
                  Total:
                </div>
                <div className="">{getGrandTotal() + "/-"}</div>
              </div>
              <div className="w-full flex justify-end items-center gap-3 px-2 my-1">
                <div className="font-semibold flex flex-col-reverse md:flex-row md:gap-1 items-center justify-end">
                  <span className="text-gray-300 text-xs font-light">
                    {"(Discount Applicable only on selected medicines)"}
                  </span>
                  Discount:
                </div>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => {
                    setDiscount(e.target.value);
                  }}
                  min={0}
                  max={5}
                  className="outline-none bg-gray-800 rounded-lg text-sm px-2 py-1 w-32"
                  placeholder="Upto 5%"
                />
              </div>
              {discount === "" ? (
                <></>
              ) : discount >= 0 && discount <= 5 ? (
                <div className="flex justify-end gap-3 items-center px-2 text-md">
                  <div className="font-semibold text-center text-blue-500">
                    Grand Total:
                  </div>
                  <div className="">
                    {getDiscountedTotal().toString() + "/-"}
                  </div>
                </div>
              ) : (
                <div className="text-red-500 px-2 text-end">
                  Discount must be between 0 to 5
                </div>
              )}
              <div className="flex justify-end gap-3 items-center px-2 text-sm">
                <div className="font-semibold text-center text-blue-500">
                  payment mode:
                </div>
                <div className="">{selectedPaymentMode}</div>
              </div>
            </div>
            <hr className="border-t border-slate-900 w-full my-2" />
            <div className="w-full flex px-4 gap-3 justify-end">
              <div
                className="px-3 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
                onClick={() => {
                  setIsAddInfoOpen(null);
                }}
              >
                Cancel
              </div>
              <button
                onClick={onSubmit}
                className={
                  "w-20 h-8 py-1 flex items-center justify-center gap-2 rounded-lg font-semibold text-white bg-green-500 disabled:bg-gray-500 "
                }
                disabled={
                  submitting ||
                  isAddInfoOpen.length === 0 ||
                  !selectedPatient ||
                  !createdAt ||
                  (discount && (discount < 1 || discount > 5))
                }
              >
                {submitting ? <Loading size={15} /> : <></>}
                {submitting ? "Wait..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewPharmacyInvoiceBackDate;
