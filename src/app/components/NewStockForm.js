"use client";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import Loading from "./Loading";

function NewStockForm({ medicines, ids }) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  // const [data, setData] = useState();
  const [result, setResult] = useState(null);

  const { register, handleSubmit, control, watch, reset } = useForm({
    defaultValues: {
      invoiceNumber: "",
      stocks: [],
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

  function onSubmit(data) {
    console.log(data);
    handleSave(data);
    // setData(data);
    // setMedicineDetailsSection(true);
  }
  async function handleSave(data) {
    setSubmitting(true);
    try {
      let result = await fetch("/api/newStock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      result = await result.json();
      setMessage(result.message);
      setResult(result.savedStocks);
      if (result.success) {
        reset();
        setTimeout(() => {
          setMessage("");
        }, 5000);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full px-2">
      <div className="flex justify-between items-center gap-2 flex-wrap my-1">
        <div
          className="bg-blue-800 cursor-pointer hover:bg-blue-700 text-white rounded-lg px-3 py-1"
          onClick={() =>
            append({
              medicine: "",
              batchName: "",
              mfgDate: "",
              expiryDate: "",
              quantity: "",
              extra: "",
              sellingPrice: "",
              purchasePrice: "",
            })
          }
        >
          Add New Stock
        </div>
        <select
          {...register("invoiceNumber", { required: true })}
          className="rounded-lg bg-gray-800 text-white px-3 py-2"
        >
          <option value="">-- Select Invoice ID --</option>
          {ids.map((id, index) => (
            <option value={id.invoiceNumber} key={index}>
              {id.invoiceNumber +
                " - " +
                (id.manufacturer ? id.manufacturer.name : id.vendor.name)}
            </option>
          ))}
        </select>
      </div>
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}
      {result && result.length > 0 && (
        <ol>
          {result.map((med, index) => {
            let name = medicines.find(
              (medicine) => medicine._id === med.medicine
            )?.name;
            return (
              <li
                key={index}
                className={med.success ? "text-gray-900" : "text-red-600"}
              >
                {index + 1 + ". " + name + med.message}
              </li>
            );
          })}
          <button
            onClick={() => setResult(null)}
            className="text-white bg-blue-600 rounded-lg px-4 py-2 hover:bg-blue-700"
          >
            Clear
          </button>
        </ol>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="px-2">
        {fields.length > 0 && (
          <>
            <div className="text-center text-red-500">
              *If the packetSize details do not match then contact the admin.
            </div>
            <div className="flex flex-wrap items-center gap-2 my-2 bg-gray-800 text-white rounded-lg py-1 px-2">
              <div className="flex-1 min-w-28 text-center">Medicine</div>
              <div className="flex-1 min-w-28 text-center">Batch</div>
              <div className="flex-1 min-w-28 text-center">Mfg</div>
              <div className="flex-1 min-w-28 text-center">Expiry</div>
              <div className="flex-1 min-w-28 text-center">
                Total Qty or Pcs
              </div>
              <div className="flex-1 min-w-28 text-center">Purchase Price</div>
              <div className="flex-1 min-w-28 text-center">MRP</div>
              <div className="px-3">Action</div>
            </div>
          </>
        )}
        {fields.map((field, index) => {
          const medicineId = stocks[index]?.medicine;
          const medicineQty = stocks[index]?.quantity;
          const medicinePurchasePrice = stocks[index]?.purchasePrice;
          const medicine = medicines.find((med) => med._id === medicineId);
          const medicineIsTablets = medicine?.isTablets;
          const packetSize = medicine?.packetSize;
          return (
            <div
              key={field.id}
              className=" my-2 bg-gray-400 text-white rounded-lg py-1 px-2"
            >
              <div key={field.id} className="flex flex-wrap items-center gap-2">
                <select
                  id="medicine"
                  {...register(`stocks.${index}.medicine`, {
                    required: "Medicine is required",
                  })}
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-600"
                >
                  <option value="">-- Select a Medicine --</option>
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
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-600"
                  placeholder="Enter Batch Name"
                />
                <input
                  type="date"
                  name="mfgDate"
                  {...register(`stocks.${index}.mfgDate`)}
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-600"
                />
                <input
                  type="date"
                  name="expiryDate"
                  {...register(`stocks.${index}.expiryDate`, {
                    required: "Expiry Date is required",
                  })}
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-600"
                />
                <input
                  type="number"
                  {...register(`stocks.${index}.quantity`, {
                    required: true,
                  })}
                  placeholder="Total Strips or Pcs"
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-600"
                  min={0}
                />
                <input
                  type="number"
                  step="any"
                  {...register(`stocks.${index}.purchasePrice`, {
                    required: "Purchase Price is required",
                  })}
                  placeholder="Purchase Price"
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-600"
                />
                <input
                  type="number"
                  step="any"
                  {...register(`stocks.${index}.sellingPrice`, {
                    required: "MRP is required",
                  })}
                  placeholder="MRP"
                  className="flex-1 min-w-28 px-1 h-8 rounded-lg bg-gray-600"
                />

                <button
                  type="button"
                  className="text-red-700 hover:text-red-900"
                  onClick={() => remove(index)}
                >
                  Remove
                </button>
              </div>
              <div className="flex justify-between px-3">
                <div className="text-red-700">
                  Packet Size: {packetSize?.strips || 0} Qty/Boxes{" "}
                  {medicineIsTablets
                    ? `, ${packetSize?.tabletsPerStrip || 1} Tablets/Strip`
                    : ""}
                </div>
                <div className="text-center text-red-700">
                  {medicineQty * medicinePurchasePrice + " Rs COST PRICE"}
                </div>
                <div className="text-red-700">
                  Total: {Math.floor(medicineQty / packetSize?.strips) || 0}{" "}
                  Boxes {Number(medicineQty % packetSize?.strips) || 0} Extras
                </div>
              </div>
            </div>
          );
        })}
        <div className="text-center text-red-500">
          *Please carefully set the price of a single unit/pcs/strip/qty of
          medicines.
        </div>
        <div className="flex justify-end">
          {fields.length > 0 && (
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-800 py-2 px-4 rounded-xl font-semibold"
            >
              {submitting ? <Loading size={15} /> : <></>}
              {submitting ? "Wait..." : "Save Stock"}
            </button>
          )}
        </div>
      </form>
    </div>
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
