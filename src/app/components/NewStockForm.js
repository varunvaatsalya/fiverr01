"use client";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { RxCross1 } from "react-icons/rx";
import Loading from "./Loading";
import { useStockType } from "../context/StockTypeContext";
import { RiLoader2Line } from "react-icons/ri";
import { showInfo } from "../utils/toast";
import ImageDropUploader from "./ImageDropUploader";

function NewStockForm({ medicines, lists, type, setType, uniqueID }) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const sectionType = useStockType();

  const { register, handleSubmit, control, setValue, watch, reset } = useForm({
    defaultValues: {
      invoiceNumber: uniqueID || "",
      vendorInvoiceId: "",
      type: type || "vendor",
      source: "",
      invoiceDate: "",
      receivedDate: "",
      stocks: [],
      billImageId: "",
      isBackDated: false,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "stocks",
  });

  const stocks = watch("stocks") || [];
  useEffect(() => {
    console.log("Updated Stocks:", stocks);
  }, [stocks]);
  useEffect(() => {
    if (uniqueID) {
      setValue("invoiceNumber", uniqueID);
    }
  }, [uniqueID, setValue]);

  async function onSubmit(data) {
    console.log("Submitting data:", data);
    if (!data.billImageId) {
      showInfo("Please upload a bill image.");
      return;
    }
    setSubmitting(true);
    try {
      let result = await fetch("/api/newPurchaseInvoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, sectionType }),
      });
      result = await result.json();
      showInfo(result.message);
      setResult(result.savedStocks);
      if (result.success) {
        reset();
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  }
  let isBackDated = watch("isBackDated");
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full px-4 py-2 space-y-2 text-black rounded shadow"
    >
      <h2 className="text-xl font-bold text-center">New Purchase Invoice</h2>
      <hr className="border border-gray-300" />

      <div className="w-full flex flex-col md:flex-row items-center gap-3">
        <div className="space-y-2 w-1/2">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Auto Invoice ID
              </label>
              <div className="w-48 border border-gray-300 rounded px-2 py-1 text-center font-semibold bg-gray-100">
                {uniqueID ? (
                  uniqueID
                ) : (
                  <RiLoader2Line className="animate-spin mx-auto" />
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="Vendor Invoice Id"
                className="block text-sm font-semibold mb-1"
              >
                Vendor Invoice ID
              </label>
              <input
                type="text"
                id="vendorInvoiceId"
                placeholder="Enter Invoice ID"
                {...register("vendorInvoiceId", { required: true })}
                className="w-60 border border-gray-300 rounded px-2 py-1 bg-gray-50"
              />
            </div>
            <div>
              <label
                htmlFor="from"
                className="block text-sm font-semibold mb-1"
              >
                From
              </label>
              <select
                id="from"
                value={type}
                {...register("type", { required: true })}
                onChange={(e) => setType(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 bg-gray-50"
              >
                <option value="vendor">Vendor</option>
                <option value="manufacturer">Manufacturer</option>
              </select>
            </div>
          </div>
          <div className="w-full">
            <div className="flex-1">
              <label
                htmlFor="name"
                className="block text-sm font-semibold mb-1"
              >
                Name
              </label>
              <select
                id="name"
                {...register("source", { required: true })}
                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50"
              >
                <option value="">-- Select Name --</option>
                {lists.map((list, index) => (
                  <option key={index} value={list._id}>
                    {list.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Invoice Date + Received Date */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-48">
              <label
                htmlFor="invoiceDate"
                className="block text-sm font-semibold mb-1"
              >
                Seller Invoice Date
              </label>
              <input
                type="date"
                id="invoiceDate"
                {...register("invoiceDate", { required: true })}
                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50"
              />
            </div>
            <div className="w-48">
              <label
                htmlFor="receivedDate"
                className="block text-sm font-semibold mb-1"
              >
                Received Date
              </label>
              <input
                type="date"
                id="receivedDate"
                {...register("receivedDate", { required: true })}
                className="w-full border border-gray-300 rounded px-2 py-1 bg-gray-50"
              />
            </div>
            <div className="mx-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("isBackDated")}
                  className="size-6"
                />
                <span className="text-sm font-semibold">Is Back Dated</span>
              </label>
            </div>
          </div>
        </div>
        <div className="w-1/2 p-2 border-l border-gray-700 flex flex-col justify-center items-center gap-2">
          <label className="text-sm font-semibold">Upload Bill Image</label>
          <div className="w-full md:w-2/5">
            <ImageDropUploader
              imageId={watch("billImageId")}
              setImageId={(id) => setValue("billImageId", id)}
              folder={
                sectionType === "hospital"
                  ? "hospitalPurchaseInvoice"
                  : "pharmacyPurchaseInvoice"
              }
              purpose={`invoice-${uniqueID}`}
            />
          </div>
        </div>
      </div>
      {/* Row 1: Auto Invoice ID + Manual Invoice ID */}
      <div className="flex justify-between items-center gap-2 flex-wrap my-1 border-b-2 py-1 border-gray-400">
        <div
          className="bg-blue-800 cursor-pointer hover:bg-blue-700 text-white rounded-lg px-3 py-1"
          onClick={() =>
            append({
              medicine: "",
              batchName: "",
              mfgDate: "",
              expiryDate: "",
              availableQuantity: null,
              quantity: null,
              offer: null,
              sellingPrice: null,
              purchasePrice: null,
              sgst: null,
              cgst: null,
              discount: null,
            })
          }
        >
          Add Medicine Details
        </div>
        <div className="text-sm">
          <div className="text-center text-red-500">
            *If the packetSize details do not match then contact the admin.
          </div>
          <div className="text-center text-red-500">
            *Please carefully set the price of a single unit/pcs/strip/qty of
            medicines.
          </div>
        </div>
      </div>
      {result && result.length > 0 && (
        <ol className="w-full text-center">
          {result.map((med, index) => (
            <li
              key={index}
              className={med.success ? "text-gray-900" : "text-red-600"}
            >
              {`${index + 1}. ${med.medicine} ${med.message}`}
            </li>
          ))}
          <button
            onClick={() => setResult(null)}
            className="text-white bg-blue-600 rounded-lg px-4 py-2 hover:bg-blue-700"
          >
            Clear
          </button>
        </ol>
      )}
      <div className="px-2">
        {fields.length > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-2 my-2 bg-gray-800 text-white rounded-lg py-1 px-2">
              <div className="flex-1 min-w-28 text-center">Medicine</div>
              <div className="flex-1 min-w-28 text-center">Batch</div>
              <div className="flex-1 min-w-28 text-center">Mfg</div>
              <div className="flex-1 min-w-28 text-center">Expiry</div>
              <div className="flex-1 min-w-28 text-center">Qty or Pcs</div>
              {isBackDated && (
                <div className="flex-1 min-w-28 text-center">Avl Qty</div>
              )}
              <div className="flex-1 min-w-28 text-center">Offer/Extra</div>
              <div className="flex-1 min-w-28 text-center">MRP</div>
              <div className="flex-1 min-w-28 text-center">Rate</div>
              <div className="flex-1 min-w-28 text-center">
                {"Discount (%)"}
              </div>
              <div className="flex-1 min-w-28 text-center">{"GST (%)"}</div>
              <div className="w-6"></div>
            </div>
          </>
        )}
        {fields.map((field, index) => {
          const medicineId = stocks[index]?.medicine;

          let quantity = parseFloat(stocks[index]?.quantity || 0);
          let offer = parseFloat(stocks[index]?.offer || 0);
          let purchasePrice = parseFloat(stocks[index]?.purchasePrice || 0);
          let discount = parseFloat(stocks[index]?.discount || 0);
          let sgst = parseFloat(stocks[index]?.sgst || 0);
          let cgst = parseFloat(stocks[index]?.cgst || 0);

          const medicine = medicines.find((med) => med._id === medicineId);
          const medicineIsTablets = medicine?.isTablets;
          const packetSize = medicine?.packetSize;

          let baseAmount = quantity * purchasePrice;

          // Discount calculation
          let discountAmount = baseAmount * (discount / 100);
          let discountedAmount = baseAmount - discountAmount;

          // GST calculation
          let totalGSTPercent = sgst + cgst;
          let gstAmount = discountedAmount * (totalGSTPercent / 100);

          // Final amount paid to vendor
          let filedTotalAmount = discountedAmount + gstAmount;

          // Net Purchase Rate (quantity + offer)
          let totalUnitsReceived = quantity + offer;
          let netPurchaseRate =
            totalUnitsReceived > 0
              ? parseFloat((filedTotalAmount / totalUnitsReceived).toFixed(2))
              : 0;

          // Cost Price per strip (excluding offer)
          let costPriceBeforeTax =
            quantity > 0 ? discountedAmount / quantity : 0;
          let costPrice = quantity > 0 ? filedTotalAmount / quantity : 0;

          // Total Amount (based on cost price and quantity)
          let totalAmountBeforeTax = parseFloat(
            (costPriceBeforeTax * quantity).toFixed(2)
          );
          let totalAmount = parseFloat((costPrice * quantity).toFixed(2));

          return (
            <div
              key={field.id}
              className=" my-2 bg-gray-300 text-white rounded-lg py-1 px-2"
            >
              <div
                key={field.id}
                className="flex flex-wrap items-center text-sm gap-1"
              >
                <select
                  id="medicine"
                  {...register(`stocks.${index}.medicine`, {
                    required: "Medicine is required",
                  })}
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-700"
                >
                  <option value="">-- Medicine --</option>
                  {medicines.map((medicine, index) => (
                    <option key={index} value={medicine._id}>
                      {medicine.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="batchName"
                  {...register(`stocks.${index}.batchName`, {
                    required: "Batch Name is required",
                  })}
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-700"
                  placeholder="Batch"
                />
                <input
                  type="date"
                  name="mfgDate"
                  {...register(`stocks.${index}.mfgDate`)}
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-700"
                />
                <input
                  type="date"
                  name="expiryDate"
                  {...register(`stocks.${index}.expiryDate`, {
                    required: "Expiry Date is required",
                  })}
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-700"
                />
                <input
                  type="number"
                  {...register(`stocks.${index}.quantity`, {
                    required: true,
                  })}
                  placeholder="Total Strips or Pcs"
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-700"
                  min={0}
                />
                {isBackDated && (
                  <input
                    type="number"
                    {...register(`stocks.${index}.availableQuantity`, {
                      required: true,
                    })}
                    placeholder="Avl Strips or Pcs"
                    className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-slate-800 ring-2 ring-offset-1 ring-red-700"
                    min={0}
                  />
                )}
                <input
                  type="number"
                  {...register(`stocks.${index}.offer`)}
                  placeholder="Offer/Deal"
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-700"
                  min={0}
                />
                <input
                  type="number"
                  step="any"
                  {...register(`stocks.${index}.sellingPrice`, {
                    required: "MRP is required",
                  })}
                  placeholder="MRP"
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-700"
                />
                <input
                  type="number"
                  step="any"
                  {...register(`stocks.${index}.purchasePrice`, {
                    required: "Purchase Price is required",
                  })}
                  placeholder="Purchase Rate"
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-700"
                />
                <input
                  type="number"
                  step="any"
                  min={0}
                  max={100}
                  {...register(`stocks.${index}.discount`)}
                  placeholder="Discount in %"
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-700"
                />
                <div className="flex justify-center gap-1 flex-1 min-w-28">
                  <input
                    type="number"
                    step="any"
                    min={0}
                    max={100}
                    {...register(`stocks.${index}.sgst`)}
                    placeholder="SGST"
                    className="w-full px-1 h-8 rounded-lg bg-gray-700"
                  />
                  <input
                    type="number"
                    step="any"
                    min={0}
                    max={100}
                    {...register(`stocks.${index}.cgst`)}
                    placeholder="CGST"
                    className="w-full px-1 h-8 rounded-lg bg-gray-700"
                  />
                </div>
                <button
                  type="button"
                  className="text-red-700 hover:text-red-900"
                  onClick={() => remove(index)}
                >
                  <RxCross1 />
                </button>
              </div>
              <div className="flex justify-between px-3 pt-1 text-sm font-semibold">
                <div className="text-red-700">
                  Packet Size: {packetSize?.strips || 0} Qty/Boxes{" "}
                  {medicineIsTablets
                    ? `, ${packetSize?.tabletsPerStrip || 1} Tablets/Strip`
                    : ""}
                </div>
                <div className="text-center text-green-700">
                  {netPurchaseRate + "/- Net Purchase Rate"}
                </div>
                <div className="text-center text-red-700">
                  {parseFloat(costPrice?.toFixed(2)) + "/- COST PRICE"}
                </div>
                <div className="text-center text-red-700">
                  {"Total: " +
                    totalAmountBeforeTax +
                    "  +  GST " +
                    parseFloat(gstAmount.toFixed(2)) +
                    "/- " +
                    " = " +
                    totalAmount}
                </div>
                <div className="text-red-700">
                  Total:{" "}
                  {Math.floor(totalUnitsReceived / packetSize?.strips) || 0}{" "}
                  Boxes {Number(totalUnitsReceived % packetSize?.strips) || 0}{" "}
                  Extras
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex justify-end">
          {fields.length > 0 && (
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-1"
            >
              {submitting ? <Loading size={15} /> : <></>}
              {submitting ? "Wait..." : "Save Stock"}
            </button>
          )}
        </div>
      </div>
      <div className="py-12 w-full"></div>
    </form>
  );
}

export default NewStockForm;

{
  /*medicineDetailsSection && (
  <div className="absolute top-0 left-0">
    <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
      <div className="w-[95%] md:w-4/5 lg:w-3/4 py-4 text-center bg-slate-950 px-4 rounded-xl">
        <h2 className="font-bold text-2xl text-blue-500">
          Stock Details
        </h2>
        <hr className="border border-slate-800 w-full my-2" />
        {message && (
          <div className="my-1 text-center text-red-500">{message}</div>
        )}
        <div className="font-semibold text-white space-y-1 w-full md:w-1/2 mx-auto text-sm md:text-base">
          <div className="flex items-center gap-2">
            <div className="w-2/5 flex justify-between">
              <div className="">Manufacturer</div>
              <div className="">:</div>
            </div>
            <span className="text-blue-500">
              {selectedMedicine.manufacturer.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2/5 flex justify-between">
              <div className="">Name</div>
              <div className="">:</div>
            </div>
            <span className="text-blue-500">{selectedMedicine.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2/5 flex justify-between">
              <div className="">Salts</div>
              <div className="">:</div>
            </div>
            <span className="text-blue-500">
              {selectedMedicine.salts.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2/5 flex justify-between">
              <div className="">Box Size</div>
              <div className="">:</div>
            </div>
            <span className="text-blue-500">
              {selectedMedicine.packetSize.tabletsPerStrip +
                " Nos/Strip, & " +
                selectedMedicine.packetSize.strips +
                " Strips"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2/5 flex justify-between">
              <div className="">MRP {"(per strip)"}</div>
              <div className="">:</div>
            </div>
            <span className="text-blue-500">
              {data.sellingPrice + "/-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2/5 flex justify-between">
              <div className="">Purchase Price {"(per strip)"}</div>
              <div className="">:</div>
            </div>
            <span className="text-blue-500">
              {data.purchasePrice + "/-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2/5 flex justify-between">
              <div className="">Batch Name</div>
              <div className="">:</div>
            </div>
            <span className="text-blue-500">{data.batchName}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2/5 flex justify-between">
              <div className="">MFG Date</div>
              <div className="">:</div>
            </div>
            <span className="text-blue-500">{data.mfgDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2/5 flex justify-between">
              <div className="">Expiry Date</div>
              <div className="">:</div>
            </div>
            <span className="text-blue-500">{data.expiryDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2/5 flex justify-between">
              <div className="">Box Quantity</div>
              <div className="">:</div>
            </div>
            <span className="text-blue-500">{data.quantity}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2/5 flex justify-between">
              <div className="">Extra Strips</div>
              <div className="">:</div>
            </div>
            <span className="text-blue-500">{data.extra}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2/5 flex justify-between">
              <div className="">Invoice ID</div>
              <div className="">:</div>
            </div>
            <span className="text-blue-500">
              {invoiceID.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2/5 flex justify-between">
              <div className="">From</div>
              <div className="">:</div>
            </div>
            <span className="text-blue-500">
              {invoiceID.manufacturer
                ? invoiceID.manufacturer.name
                : invoiceID.vendor.name}
            </span>
          </div>
        </div>

        <hr className="border border-slate-800 w-full my-2" />
        <div className="flex px-4 gap-3 justify-end">
          <div
            className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
            onClick={() => {
              setMedicineDetailsSection(false);
            }}
          >
            Cancel
          </div>
          <button
            onClick={handleSave}
            className="w-20 h-8 py-1 flex items-center justify-center gap-2 bg-green-500 rounded-lg font-semibold cursor-pointer text-white"
            disabled={submitting}
          >
            {submitting ? <Loading size={15} /> : <></>}
            {submitting ? "Wait..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  </div>
)*/
}
