"use client";
import React, { useEffect, useState } from "react";
import { RiLoader2Line } from "react-icons/ri";
import { useForm } from "react-hook-form";
import Loading from "./Loading";
import { useStockType } from "../context/StockTypeContext";

function NewPurchaseInvoice({
  setNewPurchaseInvoiceSection,
  setPurchaseInvoices,
}) {
  const [lists, setLists] = useState([]);
  const [uniqueID, setUniqueID] = useState(null);
  const [type, setType] = useState("vendor");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue } = useForm();

  const sectionType = useStockType();

  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       let result = await fetch(`/api/newPurchaseInvoice?info=${type}${
  //           sectionType === "hospital" ? "&sectionType=hospital" : ""
  //         }`);
  //       result = await result.json();
  //       if (result.success) {
  //         setLists(result.lists);
  //         setUniqueID(result.uniqueID);
  //         setValue("invoiceNumber", result.uniqueID);
  //       } else {
  //         setMessage(result.message);
  //       }
  //     } catch (err) {
  //       console.log("error: ", err);
  //     }
  //   }
  //   // fetchData();
  // }, [type]);

  const onSubmit = async (data) => {
    setMessage("");
    setSubmitting(true);
    try {
      let result = await fetch("/api/newPurchaseInvoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...data, sectionType}),
      });
      result = await result.json();
      if (result.success) {
        setPurchaseInvoices((prevPurchaseInvoices) => [
          result.newPurchaseInvoice,
          ...prevPurchaseInvoices,
        ]);
        setTimeout(() => {
          setNewPurchaseInvoiceSection((prev) => !prev);
        }, 1500);
      }
      setMessage(result.message);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="absolute top-0 left-0">
      <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
        <div className="w-[95%] md:w-4/5 lg:w-3/4 text-white py-4 text-center bg-slate-950 px-4 rounded-xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="text-center text-2xl font-bold">
              New Purchase Invoice
            </div>
            <hr className="border border-slate-800 w-full my-2" />
            {message && (
              <div className="my-1 text-center text-red-500">{message}</div>
            )}
            <div className="font-semibold text-lg">Invoice ID</div>
            <div className="w-4/5 lg:w-1/2 mx-auto border-2 border-gray-700 rounded-lg bg-gray-800 p-4 font-bold text-2xl">
              {uniqueID ? (
                uniqueID
              ) : (
                <RiLoader2Line className="animate-spin mx-auto" />
              )}
            </div>
            <div className="flex justify-center items-center gap-3 my-2">
              <label htmlFor="from" className="text-lg font-semibold">
                From:
              </label>
              <select
                name="from"
                id="from"
                value={type}
                {...register("type", {
                  required: true,
                })}
                onChange={(e) => setType(e.target.value)}
                className="rounded-lg bg-gray-800 px-6 py-2"
              >
                <option value="vendor">Vendor</option>
                <option value="manufacturer">Manufacturer</option>
              </select>
            </div>
            <label htmlFor="name" className="text-lg font-semibold">
              Name:{" "}
            </label>
            <select
              name="name"
              id="name"
              {...register("name", {
                required: true,
              })}
              // value={type}
              // onChange={(e) => setType(e.target.value)}
              className="rounded-lg bg-gray-800 px-6 py-2"
            >
              <option value="">-- Select Name --</option>
              {lists.map((list, index) => (
                <option key={index} value={list._id}>
                  {list.name}
                </option>
              ))}
            </select>

            <div className="flex flex-col lg:flex-row justify-center items-center gap-3 my-2">
              <div>
                <label htmlFor="invoiceDate" className="text-lg font-semibold">
                  Seller Invoice Date:{" "}
                </label>
                <input
                  type="date"
                  {...register("invoiceDate", {
                    required: true,
                  })}
                  name="invoiceDate"
                  id="invoiceDate"
                  className=" bg-gray-700 p-2 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="receivedDate" className="text-lg font-semibold">
                  Received Date:{" "}
                </label>
                <input
                  type="date"
                  {...register("receivedDate", {
                    required: true,
                  })}
                  name="receivedDate"
                  id="receivedDate"
                  className=" bg-gray-700 p-2 rounded-lg"
                />
              </div>
            </div>

            <hr className="border border-slate-800 w-full my-2" />
            <div className="flex px-4 gap-3 justify-end">
              <div
                className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
                onClick={() => {
                  setNewPurchaseInvoiceSection((prev) => !prev);
                }}
              >
                Cancel
              </div>
              <button
                type="submit"
                className="w-20 h-8 py-1 flex items-center justify-center gap-2 bg-red-500 disabled:bg-gray-600 rounded-lg font-semibold text-white"
                disabled={submitting}
              >
                {submitting ? <Loading size={15} /> : <></>}
                {submitting ? "Wait..." : "Confirm"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NewPurchaseInvoice;
