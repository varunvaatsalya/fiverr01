"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Loading from "./Loading";

function EditStockForm({ medicines }) {
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [letters, setLetters] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [selectedStocks, setSelectedStocks] = useState(null);
  const [medicineDetailsSection, setMedicineDetailsSection] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [data, setData] = useState(null);
  const [stocks, setStocks] = useState([]);

  const { register, handleSubmit, reset, setValue } = useForm();

  // const getUniqueStartingLetters = () => {
  //   const uniqueLetters = [
  //     ...new Set(medicines.map((medicine) => medicine.name[0].toUpperCase())),
  //   ].sort();
  //   setSelectedLetter(uniqueLetters[0]);
  //   setLetters(uniqueLetters);
  // };

  // const fetchData = async () => {
  //   try {
  //     setMessage(null);
  //     let result = await fetch(`/api/editRetailStock`);
  //     result = await result.json();

  //     if (result.success) {
  //       let medcinesStock = groupAndCountMedicines(result.stocks);
  //       setMedicineStock(medcinesStock);
  //       console.log(medcinesStock);
  //     } else setMessage(result.message);
  //   } catch (error) {
  //     console.error("Error submitting application:", error);
  //   } finally {
  //     setTimeout(() => {
  //       setMessage("");
  //     }, 3500);
  //   }
  // };
  // useEffect(() => {
  //   getUniqueStartingLetters();
  //   fetchData();
  // }, []);

  useEffect(() => {
    if (selectedMedicine) {
      fetch(`/api/newStock?batchInfo=${selectedMedicine._id}`)
        .then((res) => res.json())
        .then((data) => {
          setStocks(data.stocks);
        });
    }
  }, [selectedMedicine]);

  function onSubmit(data) {
    console.log(data);
    setData(data);
    setMedicineDetailsSection(true);
  }

  async function handleUpdate() {
    console.log(data);
    setSubmitting(true);
    try {
      let result = await fetch("/api/newStock", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      result = await result.json();
      setMessage(result.message);
      if (result.success) {
        reset();
        setMedicineDetailsSection(false);
        setSelectedMedicine(null);
        setSelectedStocks(null);
        setData(null);
      }
      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="w-[95%] md:w-4/5 lg:w-3/4 text-center border border-slate-800 rounded-xl mx-auto my-2">
      {medicineDetailsSection && (
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
                  onClick={handleUpdate}
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
      )}
      <div className="text-center py-2 rounded-t-xl bg-slate-800 text-xl font-medium">
        Edit Stock
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="p-2">
        <label className="block font-semibold text-gray-900" htmlFor="medicine">
          Select Medicine
        </label>
        <select
          id="medicine"
          {...register("medicine", { required: "Medicine is required" })}
          onChange={(e) => {
            const medicine = medicines.find(
              (med) => med._id === e.target.value
            );
            setSelectedMedicine(medicine);
            setSelectedStocks(null);
          }}
          className="mt-1 block px-4 py-3 text-white w-full md:w-3/4 mx-auto bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">-- Select a Medicine --</option>
          {medicines.map((medicine, index) => (
            <option key={index} value={medicine._id}>
              {medicine.name}
            </option>
          ))}
        </select>
        {selectedMedicine && (
          <>
            <div className="font-semibold text-gray-900 my-2 space-y-1 w-full md:w-1/2 mx-auto text-sm md:text-base">
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
              {/* <div className="flex items-center gap-2">
              <div className="w-2/5 flex justify-between">
                <div className="">previos stock MRP</div>
                <div className="">:</div>
              </div>
              <span className="text-blue-500">
                {selectedMedicine.sellingPrice?selectedMedicine.sellingPrice:"Not Available"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2/5 flex justify-between">
                <div className="">previous purchase price</div>
                <div className="">:</div>
              </div>
              <span className="text-blue-500">
                {selectedMedicine.purchasePrice?selectedMedicine.purchasePrice:"Not Available"}
              </span>
            </div> */}
              <div className="text-center text-red-500">
                *If the details do not match then contact the admin.
              </div>
            </div>

            <label
              className="block font-semibold text-gray-900"
              htmlFor="medicine"
            >
              Select Stock
            </label>
            <select
              id="stock"
              {...register("stockId", { required: "stocksId is required" })}
              onChange={(e) => {
                const Stocks = stocks.find(
                  (stock) => stock._id === e.target.value
                );
                let getDate = (timestamp) => {
                  if (!timestamp) return;
                  const date = new Date(timestamp);
                  return date.toISOString().split("T")[0];
                };
                setSelectedStocks(Stocks);
                if (Stocks) {
                  setValue("batchName", Stocks.batchName);
                  setValue("mfgDate", getDate(Stocks.mfgDate));
                  setValue("expiryDate", getDate(Stocks.expiryDate));
                  setValue("quantity", Stocks.quantity.boxes);
                  setValue("extra", Stocks.quantity.extra);
                  setValue("sellingPrice", Stocks.sellingPrice);
                  setValue("purchasePrice", Stocks.purchasePrice);
                } else reset();
              }}
              className="mt-1 block px-4 py-3 text-white w-full md:w-3/4 mx-auto bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
            >
              <option value={null}>-- Select a Stock to edit --</option>
              {stocks.map((stock, index) => (
                <option key={index} value={stock._id}>
                  {stock.batchName}
                </option>
              ))}
            </select>
          </>
        )}
        {selectedStocks && (
          <>
            {" "}
            <div className="block font-semibold text-gray-900">Batch Name</div>
            <div className="flex justify-center items-center text-gray-800 py-1">
              <input
                type="text"
                name="batchName"
                {...register("batchName", {
                  required: "Batch Name is required",
                })}
                className="p-2 rounded-xl w-full md:w-3/4 bg-gray-300 text-gray-900"
                placeholder="Enter Batch Name"
              />
            </div>
            <div className="block font-semibold text-gray-900">MFG Date</div>
            <div className="flex justify-center items-center text-gray-800 py-1">
              <input
                type="date"
                name="mfgDate"
                {...register("mfgDate")}
                className="p-2 rounded-xl w-full md:w-3/4 bg-gray-300 text-gray-900"
              />
            </div>
            <div className="block font-semibold text-gray-900">Expiry Date</div>
            <div className="flex justify-center items-center text-gray-800 py-1">
              <input
                type="date"
                name="expiryDate"
                {...register("expiryDate", {
                  required: "Expiry Date is required",
                })}
                className="p-2 rounded-xl w-full md:w-3/4 bg-gray-300 text-gray-900"
              />
            </div>
            <div className="block font-semibold text-gray-900">
              Select Number of Boxes
            </div>
            <div className="flex justify-center items-center text-gray-800 py-1">
              <input
                type="number"
                {...register("quantity", {
                  required: true,
                })}
                placeholder="Nos of Boxes"
                className="p-2 rounded-xl w-1/2 bg-gray-300"
                min={0}
              />
            </div>
            <div className="block font-semibold text-gray-900">
              Select Extra/offer Medicine Strips
            </div>
            <div className="flex justify-center items-center text-gray-800 py-1">
              <input
                type="number"
                {...register("extra")}
                placeholder="Nos of Extra Strips"
                className="p-2 rounded-xl w-1/2 bg-gray-300"
                min={0}
              />
            </div>
            <div className="text-center text-red-500">
              *Please carefully set the price of a single unit/pcs/strip/qty of
              medicines.
            </div>
            <div className="flex justify-center items-center text-gray-800 py-1 gap-10">
              <div className="flex-flex-col justify-center items-center">
                <div className="block font-semibold text-gray-900">
                  MRP of Strip
                </div>
                <input
                  type="number"
                  {...register("sellingPrice", {
                    required: "MRP is required",
                  })}
                  placeholder="MRP"
                  className="p-2 rounded-xl w-40 bg-gray-300"
                  min={1}
                />
              </div>
              <div className="flex-flex-col justify-center items-center">
                <div className="block font-semibold text-gray-900">
                  Purchase Price of Strip
                </div>
                <input
                  type="number"
                  {...register("purchasePrice", {
                    required: "Purchase Price is required",
                  })}
                  placeholder="Purchase Price"
                  className="p-2 rounded-xl w-40 bg-gray-300"
                  min={1}
                />
              </div>
            </div>
            <hr className="border-t border-slate-500 w-full my-2" />
            <div className="w-full md:w-3/4 mx-auto flex justify-center itmes-center my-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-800 py-2 px-4 rounded-xl font-semibold"
              >
                Add
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default EditStockForm;
