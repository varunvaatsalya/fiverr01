"use client";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { RxCross1 } from "react-icons/rx";
import Loading from "./Loading";
import { useStockType } from "../context/StockTypeContext";
import { RiLoader2Line } from "react-icons/ri";
import { showError, showInfo } from "../utils/toast";
import MultiImageUploader from "./MultiImageUploader";
import { format } from "date-fns";

function NewStockForm({
  medicines,
  lists,
  type,
  setType,
  uniqueID,
  setUniqueID,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [editInvoices, setEditInvoices] = useState([]);
  const [selectedEditInvoice, setSelectedEditInvoice] = useState(null);
  const [recentStock, setRecentStock] = useState({});

  const sectionType = useStockType();
  2;

  useEffect(() => {
    async function fetchEditInvoices() {
      try {
        let result = await fetch(
          "/api/newPurchaseInvoice?editInvoice=1&sectionType=" + sectionType
        );
        result = await result.json();
        if (result.success) {
          setEditInvoices(result.editInvoices || []);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchEditInvoices();
  }, []);

  const defaultValues = {
    invoiceNumber: uniqueID || "",
    vendorInvoiceId: "",
    type: type || "vendor",
    source: "",
    invoiceDate: "",
    receivedDate: "",
    stocks: [],
    // billImageId: "",
    billImageIds: [],
    isBackDated: false,
  };

  const { register, handleSubmit, control, setValue, watch, reset, getValues } =
    useForm({
      defaultValues,
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "stocks",
  });

  const {
    fields: bills, // [{id, url}]
    append: appendBill, // {id, url}
    remove: removeBill, // (id) => {}
    update: updateBill,
  } = useFieldArray({
    control,
    name: "billImageIds",
  });

  const stocks = watch("stocks") || [];
  // useEffect(() => {
  //   console.log("Updated Stocks:", stocks);
  // }, [stocks]);
  useEffect(() => {
    if (uniqueID) {
      setValue("invoiceNumber", uniqueID);
    }
  }, [uniqueID, setValue]);

  const handleGetMedStocksMetaDetails = async (medicineId) => {
    if (!medicineId || recentStock[medicineId]) return;

    try {
      const res = await fetch(
        `/api/newPurchaseInvoice/stockOfferDetails?id=${medicineId}`
      );
      const data = await res.json();

      if (data.success) {
        setRecentStock((prev) => ({
          ...prev,
          [medicineId]: data.latestStock,
        }));
      }
    } catch (err) {
      console.error("Error fetching recent stock:", err);
    }
  };

  function calculateStockValues(stock) {
    let quantity = parseFloat(stock?.quantity || 0);
    let offer = parseFloat(stock?.offer || 0);
    let purchasePrice = parseFloat(stock?.purchasePrice || 0);
    let discount = parseFloat(stock?.discount || 0);
    let sgst = parseFloat(stock?.sgst || 0);
    let cgst = parseFloat(stock?.cgst || 0);

    // Base amount
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
    let costPriceBeforeTax = quantity > 0 ? discountedAmount / quantity : 0;
    let costPrice = quantity > 0 ? filedTotalAmount / quantity : 0;

    // Total Amount (based on cost price and quantity)
    let totalAmountBeforeTax = parseFloat(
      (costPriceBeforeTax * quantity).toFixed(2)
    );
    let totalAmount = parseFloat((costPrice * quantity).toFixed(2));

    return {
      // baseAmount,
      // discountAmount,
      // discountedAmount,
      // gstAmount,
      // filedTotalAmount,
      // netPurchaseRate,

      netPurchaseRate,
      costPrice,
      totalAmountBeforeTax,
      gstAmount,
      totalAmount,
      totalUnitsReceived,
    };
  }

  const grandTotal = stocks.reduce(
    (acc, stock) => acc + calculateStockValues(stock).totalAmount,
    0
  );

  async function onSubmit(data) {
    // console.log("Submitting data:", data);
    // if (selectedEditInvoice) return;

    for (let i = 0; i < data.stocks.length; i++) {
      const stock = data.stocks[i];
      const qty = Number(stock.quantity || 0);
      const offer = Number(stock.offer || 0);
      const avlQty = Number(stock.availableQuantity || 0);
      const purchasePrice = Number(stock.purchasePrice || 0);
      const sellingPrice = Number(stock.sellingPrice || 0);

      if (avlQty > qty + offer) {
        showError(
          `Row ${i + 1}: Available Quantity cannot exceed Quantity + Offer`
        );
        return;
      }

      if (stock.mfgDate && stock.expiryDate) {
        const mfg = new Date(stock.mfgDate);
        const exp = new Date(stock.expiryDate);
        if (exp <= mfg) {
          showError(
            `Row ${i + 1}: Expiry Date must be after Manufacturing Date`
          );
          return;
        }
      }

      if (sellingPrice < purchasePrice) {
        showError(
          `Row ${i + 1}: Selling Price (MRP) cannot be less than Purchase Price`
        );
        return;
      }
    }
    // data.invoiceNumber = uniqueID;
    const finalIds = data.billImageIds
      .filter((img) => !(img.used && img.markForDelete))
      .map((img) => img._id);

    if (finalIds.length === 0) {
      showError("At least one bill image is required");
      return;
    }
    setSubmitting(true);
    try {
      let result = await fetch(
        `/api/newPurchaseInvoice${selectedEditInvoice ? "?editMode=1" : ""}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            billImageIds: finalIds,
            sectionType,
          }),
        }
      );
      result = await result.json();
      showInfo(result.message);
      // setResult(result.savedStocks);
      if (result.success) {
        const deleteExistingIds = data.billImageIds
          .filter((img) => img.used && img.markForDelete)
          .map((img) => img._id);

        if (deleteExistingIds.length) {
          await fetch("/api/uploads/delete?multiple=1", {
            method: "POST",
            body: JSON.stringify({ ids: deleteExistingIds }),
            headers: { "Content-Type": "application/json" },
          });
        }

        if (result.newUniqueId) setUniqueID(result.newUniqueId);
        if (selectedEditInvoice) {
          setEditInvoices((prev) =>
            prev.filter((inv) => inv._id !== selectedEditInvoice)
          );
        }
        setSelectedEditInvoice(null);
        reset(defaultValues);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  }
  let isBackDated = watch("isBackDated");
  let UniqueIdInvoiceNumber = watch("invoiceNumber");
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full px-4 py-2 space-y-2 text-black rounded shadow"
    >
      <div className="flex items-center justify-between px-3">
        <h2 className="text-xl font-bold">
          <span className="text-blue-600">
            {sectionType === "hospital" ? "Hospital's" : "Pharmacy's"}
          </span>{" "}
          New Purchase Invoice
        </h2>
        <select
          name="editInvoice"
          id="editInvoice"
          value={selectedEditInvoice || ""}
          onChange={(e) => {
            const selectedInvoice = editInvoices.find(
              (inv) => inv._id === e.target.value
            );
            if (selectedInvoice) {
              setType(selectedInvoice.type || "vendor");
              selectedInvoice.billImageIds =
                selectedInvoice.billImageIds?.map((img) => ({
                  ...img,
                  used: true,
                  markForDelete: false,
                })) || [];
              setTimeout(() => {
                reset(selectedInvoice);
              }, 800);
              setSelectedEditInvoice(selectedInvoice._id);
            } else {
              setSelectedEditInvoice(null);
              reset(defaultValues);
              setType("vendor");
            }
            // console.log(getValues());
          }}
          className="border border-gray-300 rounded px-2 py-1 bg-gray-50"
        >
          <option value={""}>--Select Invoice To Edit--</option>
          {editInvoices.length > 0 ? (
            editInvoices.map((inv, idx) => (
              <option key={idx} value={inv._id}>
                {inv.invoiceNumber}
              </option>
            ))
          ) : (
            <option disabled>No Invoice for edit</option>
          )}
        </select>
      </div>
      <hr className="border border-gray-300" />

      <div className="w-full flex flex-col md:flex-row items-start gap-3">
        <div className="space-y-2 w-1/2">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Auto Invoice ID
              </label>
              <div className="w-48 border border-gray-300 rounded px-2 py-1 text-center font-semibold bg-gray-100">
                {UniqueIdInvoiceNumber ? (
                  UniqueIdInvoiceNumber
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
        <div className="w-1/2 px-2 space-y-2 border-t md:border-t-0 md:border-l border-gray-700">
          <label className="text-sm font-semibold">Upload Bill Image</label>
          <div className="w-full max-h-72 overflow-y-auto">
            <MultiImageUploader
              imageIds={watch("billImageIds") || []}
              setImageIds={(ids) => setValue("billImageIds", ids)}
              images={bills}
              addImage={appendBill} // {id, url}
              removeImage={removeBill} // (id) => {}
              updateImage={updateBill} // (index, {id, url}) => {}
              limit={10}
              multiple={true}
              folder={
                sectionType === "hospital"
                  ? "hospitalPurchaseInvoice"
                  : "pharmacyPurchaseInvoice"
              }
              // folder={"testFolder"}
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
        <div className="font-semibold px-2">
          Grand Total:{" "}
          <span className="text-blue-600 font-bold">{`${parseFloat(
            grandTotal.toFixed(2)
          )}/-`}</span>
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
            type="button"
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
                <div
                  title="Not yet used quantity from this purchase!"
                  className="flex-1 min-w-28 text-center"
                >
                  Avl Qty(Pack)
                </div>
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
          const medicine = medicines.find((med) => med._id === medicineId);
          const medicineIsTablets = medicine?.isTablets;
          const packetSize = medicine?.packetSize;

          let offers = medicine?.offers?.[0] || null;

          const stock = stocks[index] || {};
          const {
            netPurchaseRate,
            costPrice,
            totalAmountBeforeTax,
            gstAmount,
            totalAmount,
            totalUnitsReceived,
          } = calculateStockValues(stock);

          // let quantity = parseFloat(stocks[index]?.quantity || 0);
          // let offer = parseFloat(stocks[index]?.offer || 0);
          // let purchasePrice = parseFloat(stocks[index]?.purchasePrice || 0);
          // let discount = parseFloat(stocks[index]?.discount || 0);
          // let sgst = parseFloat(stocks[index]?.sgst || 0);
          // let cgst = parseFloat(stocks[index]?.cgst || 0);

          // let baseAmount = quantity * purchasePrice;

          // // Discount calculation
          // let discountAmount = baseAmount * (discount / 100);
          // let discountedAmount = baseAmount - discountAmount;

          // // GST calculation
          // let totalGSTPercent = sgst + cgst;
          // let gstAmount = discountedAmount * (totalGSTPercent / 100);

          // // Final amount paid to vendor
          // let filedTotalAmount = discountedAmount + gstAmount;

          // // Net Purchase Rate (quantity + offer)
          // let totalUnitsReceived = quantity + offer;
          // let netPurchaseRate =
          //   totalUnitsReceived > 0
          //     ? parseFloat((filedTotalAmount / totalUnitsReceived).toFixed(2))
          //     : 0;

          // // Cost Price per strip (excluding offer)
          // let costPriceBeforeTax =
          //   quantity > 0 ? discountedAmount / quantity : 0;
          // let costPrice = quantity > 0 ? filedTotalAmount / quantity : 0;

          // // Total Amount (based on cost price and quantity)
          // let totalAmountBeforeTax = parseFloat(
          //   (costPriceBeforeTax * quantity).toFixed(2)
          // );
          // let totalAmount = parseFloat((costPrice * quantity).toFixed(2));

          const mfgDate = watch(`stocks.${index}.mfgDate`);
          const expiryDate = watch(`stocks.${index}.expiryDate`);

          return (
            <div
              key={field.id}
              className=" my-2 bg-gray-300 text-white rounded-lg py-1 px-2 relative group"
            >
              <div className="absolute z-50 left-0 top-full mt-1 hidden group-hover:block group-focus-within:block transition">
                <div className="flex items-start gap-2 ">
                  {recentStock[medicineId] && (
                    <div className="max-w-2xl border border-gray-500 bg-gray-800 text-white text-sm rounded-md shadow-md p-2">
                      <p className="font-bold">Recent Stock</p>
                      <div className="grid grid-cols-2 gap-x-1">
                        <p className="font-semibold">Batch:</p>
                        <p>{recentStock[medicineId].batchName}</p>
                        <p className="font-semibold">Expiry:</p>
                        <p>
                          {format(
                            new Date(recentStock[medicineId].expiryDate),
                            "MM/yy"
                          )}
                        </p>
                        <p className="font-semibold">MRP:</p>
                        <p>₹{recentStock[medicineId].sellingPrice}</p>

                        <p className="font-semibold">Purchase:</p>
                        <p>₹{recentStock[medicineId].purchasePrice}</p>
                        <p className="font-semibold">Added on:</p>
                        <p>
                          {format(
                            new Date(recentStock[medicineId].createdAt),
                            "MM/yy"
                          )}
                        </p>
                        <p className="font-semibold">From:</p>
                        <p className="text-red-600 capitalize">
                          {recentStock[medicineId].by}
                        </p>
                      </div>
                    </div>
                  )}
                  {offers && (
                    <div className="max-w-2xl border border-gray-500 bg-gray-800 text-white text-sm rounded-md shadow-md p-2">
                      <p className="font-bold">Offer Details</p>
                      <div className="grid grid-cols-2 gap-x-1">
                        <p className="font-semibold">Buying Qty:</p>
                        <p>{offers.buyingQty || "-"}</p>
                        <p className="font-semibold">Offer Qty:</p>
                        <p>{offers.offerQty || "-"}</p>
                        <p className="font-semibold">Agreed Rate:</p>
                        <p>{offers.agreedRate || "-"}</p>
                        <p className="font-semibold">Date:</p>
                        <p>
                          {offers.createdAt
                            ? format(
                                new Date(offers.createdAt),
                                "dd/MM/yy hh:mm a"
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center text-sm gap-1">
                <select
                  id="medicine"
                  {...register(`stocks.${index}.medicine`, {
                    required: "Medicine is required",
                    onChange: (e) =>
                      handleGetMedStocksMetaDetails(e.target.value),
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
                  {...register(`stocks.${index}.mfgDate`, {
                    required: "Mfg Date is required",
                  })}
                  max={expiryDate || undefined}
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-700"
                />
                <input
                  type="date"
                  name="expiryDate"
                  {...register(`stocks.${index}.expiryDate`, {
                    required: "Expiry Date is required",
                  })}
                  min={mfgDate || undefined}
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
                      min: 0,
                    })}
                    placeholder="Not yet used"
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
              {submitting
                ? "Wait..."
                : selectedEditInvoice
                ? "Update Stock"
                : "Save Stock"}
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
