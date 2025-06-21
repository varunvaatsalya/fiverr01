"use client";
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import PharmacySectionComponent from "./PharmacySectionComponent";
import { IoCreate } from "react-icons/io5";
import NewPharmacyExpressInvoice from "./NewPharmacyExpressInvoice";
import { formatDateTimeToIST } from "../utils/date";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { MdDeleteSweep } from "react-icons/md";
import NewPharmacyInvoice from "./NewPharmacyInvoice";
import InvoicePharmacy from "./InvoicePharmacy";
import { showError, showSuccess } from "../utils/toast";

function ExpressBillSearchList({
  page,
  setPage,
  totalPages,
  role,
  isEditPermission = false,
  expressBills,
  setExpressBills,
}) {
  const [resData, setResData] = useState([]);
  const [newInvoiceSection, setNewInvoiceSection] = useState(false);
  const [editExpressInvoice, setEditExpressInvoice] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  //   const [medicineDetails, setMedicineDetails] = useState(null);
  const [isDeleteing, setIsDeleting] = useState(false);
  const [createInvoiceSection, setCreateInvoiceSection] = useState(false);
  const [expressData, setExpressData] = useState(null);
  const [printInvoice, setPrintInvoice] = useState(null);

  useEffect(() => {
    setResData(expressBills);
  }, [expressBills]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  async function handleDeleteInvoice(id) {
    setIsDeleting(true);
    try {
      let result1 = await fetch("/api/newExpressBill", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });
      result1 = await result1.json();
      if (result1.success) {
        setExpressBills((prevBills) =>
          prevBills.filter((bill) => bill._id !== id)
        );
        setActiveIndex(null);
      } else {
        setMessage(result1.message);
      }
    } catch (err) {
      console.log("error: ", err);
    }
    setIsDeleting(false);
  }
  async function handleDeleteAllExpressInv() {
    setIsDeleting(true);
    if (!window.confirm("Are you sure you want to delete all express bills?")) {
      setIsDeleting(false);
      return;
    }
    try {
      let result = await fetch("/api/newExpressBill/removeAll");
      result = await result.json();
      if (result.success) {
        setExpressBills([]);
        setActiveIndex(null);
        showSuccess(result.message);
      } else {
        showError(result.message);
      }
    } catch (err) {
      console.log("error: ", err);
    }
    setIsDeleting(false);
  }

  if (role === "stockist" && !isEditPermission) {
    console.log("role: ", role);
    console.log("isEditPermission: ", isEditPermission);
    return (
      <div className="w-[95%] md:w-4/5 lg:w-3/4 text-center bg-slate-800 text-white py-2 text-lg rounded-xl mx-auto my-2">
        You do not have permission to edit medicines bills.
      </div>
    );
  }

  if (printInvoice) {
    return (
      <>
        <div className="bg-white h-full">
          <InvoicePharmacy
            printInvoice={printInvoice}
            setPrintInvoice={setPrintInvoice}
          />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {newInvoiceSection && (
        <PharmacySectionComponent
          setNewInvoiceSection={setNewInvoiceSection}
          setExpressBills={setExpressBills}
          FormComponent={NewPharmacyExpressInvoice}
          editExpressInvoice={editExpressInvoice}
          setEditExpressInvoice={setEditExpressInvoice}
        />
      )}
      {createInvoiceSection && expressData && (
        <PharmacySectionComponent
          setNewInvoiceSection={setCreateInvoiceSection}
          setExpressBills={setExpressBills}
          FormComponent={NewPharmacyInvoice}
          setPrintInvoice={setPrintInvoice}
          expressData={expressData}
          setExpressData={setExpressData}
        />
      )}

      <Navbar route={["Pharmacy Express Invoice"]} />
      <div className="px-2 lg:px-4 w-full md:w-4/5 mx-auto flex-1">
        <div className="h-16 py-2 flex justify-center gap-2 items-center">
          <input
            type="text"
            placeholder="Search"
            // onChange={(e) => {
            //   updatedata(e.target.value);
            // }}
            className="h-full w-full my-3 text-black text-xl font-medium px-4 rounded-full outline-none bg-gray-300 border-b-2 border-gray-400 focus:bg-gray-400"
          />
          {(role === "admin" || role === "nurse" || role === "stockist") && (
            <button
              onClick={() => {
                setNewInvoiceSection((newInvoiceSection) => !newInvoiceSection);
              }}
              className="flex justify-center items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 h-full rounded-full font-semibold"
            >
              <IoCreate className="size-6" />
              <div>Add</div>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <button className="p-2 rounded-full bg-red-600 text-white text-sm flex items-center gap-1">
              <MdDeleteSweep className="size-6" />
              <span
                onClick={handleDeleteAllExpressInv}
                className="font-semibold"
              >
                {isDeleteing?"Deleteing...":"Delete All"}
              </span>
            </button>
          )}
          <div className="h-12 flex justify-center items-center text-xl rounded-full flex-1 px-2 mx-auto bg-black text-white">
            List of all the Pharmacy Express Invoices
          </div>
        </div>
        <div className="flex flex-wrap justify-center items-center mx-auto">
          {resData.length > 0 ? (
            resData.map((invoice, index) => (
              <div key={index} className="text-black w-full px-2 mx-auto">
                <div
                  className="px-4 py-2 cursor-pointer border-b-2 border-gray-300 hover:rounded-full hover:bg-gray-300 flex justify-between items-center"
                  onClick={() =>
                    setActiveIndex(activeIndex === index ? null : index)
                  }
                >
                  <div className="">{index + 1}</div>
                  <h3 className="font-semibold text-lg capitalize">
                    {invoice.patientId?.name}
                  </h3>
                  <div className="">{invoice.inid}</div>
                  <div className="flex justify-center items-center gap-2">
                    {/* {!invoice.isDelivered && (
                      <AiFillMedicineBox className="text-yellow-600 size-6" />
                    )} */}
                    <span className="text-gray-500 w-4 text-center">
                      {activeIndex === index ? "-" : "+"}
                    </span>
                  </div>
                </div>

                {/* Patient Items (Shown when expanded) */}
                {activeIndex === index && (
                  <div className="w-full px-3 pb-3 bg-gray-200 rounded-b-xl ">
                    <div className="flex flex-wrap gap-x-4 justify-around border-b-2 border-gray-400 py-2">
                      <div className="py-1 px-4 ">
                        UHID:{" "}
                        <span className="text-blue-500 font-semibold">
                          {invoice.patientId?.uhid}
                        </span>
                      </div>
                      <div className="py-1 px-4 ">
                        Create At:{" "}
                        <span className="text-blue-500 font-semibold uppercase">
                          {formatDateTimeToIST(invoice.createdAt)}
                        </span>
                      </div>
                      {/* {invoice.isDelivered && (
                        <div className="py-1 px-4 ">
                          Delivered At:{" "}
                          <span className="text-blue-500 font-semibold uppercase">
                            {formatDateTimeToIST(invoice.isDelivered)}
                          </span>
                        </div>
                      )} */}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {invoice.medicines.map((medicine, it) => {
                        // const calculateTotalAllocated =
                        //   medicine.allocatedStock.reduce(
                        //     (totals, stock) => {
                        //       totals.strips += stock.quantity.strips;
                        //       totals.tablets += stock.quantity.tablets;
                        //       return totals;
                        //     },
                        //     { strips: 0, tablets: 0 }
                        //   );

                        return (
                          <div
                            className="border-b-2 w-full mx-auto border-gray-300 flex flex-wrap text-sm"
                            key={it}
                          >
                            <div className="w-10 p-2 text-center">
                              {it + 1 + "."}
                            </div>
                            <div className="w-1/3 p-2 text-center">
                              {medicine.medicineId.name}
                            </div>
                            <div className="flex-1 p-2 text-center text-wrap">
                              {medicine.medicineId.salts.name}
                            </div>
                            <div className="w-1/3 p-2 text-center">
                              {medicine.quantity?.normalQuantity > 0
                                ? medicine.quantity?.normalQuantity + "Pcs"
                                : (medicine.quantity.strips
                                    ? medicine.quantity.strips + " Strips"
                                    : "") +
                                  " " +
                                  (medicine.quantity.tablets
                                    ? medicine.quantity.tablets + " Tablets"
                                    : "")}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-around items-center gap-2 mt-3">
                      {(role === "admin" ||
                        role === "nurse" ||
                        role === "stockist") && (
                        <>
                          <button
                            className="py-2 px-4 text-white bg-red-700 hover:bg-red-800 rounded-lg font-semibold flex gap-1 items-center"
                            disabled={isDeleteing}
                            onClick={() => {
                              handleDeleteInvoice(invoice._id);
                            }}
                          >
                            {isDeleteing ? "Deleting..." : "Delete"}
                          </button>
                          <button
                            className="py-2 px-4 text-white bg-blue-700 hover:bg-blue-800 rounded-lg font-semibold flex gap-1 items-center"
                            onClick={() => {
                              setEditExpressInvoice(invoice);
                              setNewInvoiceSection(true);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="py-2 px-4 text-white bg-slate-900 rounded-lg font-semibold flex gap-1 items-center"
                            onClick={() => {
                              console.log(invoice);
                              setExpressData(invoice);
                              setCreateInvoiceSection(true);
                            }}
                          >
                            Create Invoice
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500 font-semibold text-lg">
              *No Invoice Records
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 pr-4 ">
        {/* <div
          className="px-4 py-3 bg-gray-900 text-white text-lg rounded-lg font-bold cursor-pointer"
          onClick={() => {
            if (advSearch) {
              setSearchedPrescription(null);
            }
            setAdvSearch(!advSearch);
          }}
        >
          {advSearch ? "Close" : "Advanced Search"}
        </div> */}
        {/* {!advSearch && ( */}
        <div className="bg-gray-900 rounded-lg">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1}
            className="p-3"
          >
            <FaArrowLeft size={20} />
          </button>
          <span className="text-white border-x border-white p-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="p-3"
          >
            <FaArrowRight size={20} />
          </button>
        </div>
        {/* )} */}
      </div>
    </div>
  );
}

export default ExpressBillSearchList;
