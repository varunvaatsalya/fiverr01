"use client";
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import PharmacySectionComponent from "./PharmacySectionComponent";
import { IoCreate } from "react-icons/io5";
import NewPurchaseInvoice from "./NewPurchaseInvoice";
// import EditPharmacyInvoice from "./EditPharmacyInvoice";
import StockDetails from "./StockDetails";
import { formatDateTimeToIST, formatDateToIST } from "../utils/date";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { FaCheckCircle, FaFileInvoiceDollar } from "react-icons/fa";
import { useStockType } from "../context/StockTypeContext";

function PurchaseInvoiceSearchList({
  page,
  setPage,
  totalPages,
  purchaseInvoices,
  setPurchaseInvoices,
  accessInfo,
}) {
  const [resData, setResData] = useState([]);
  const [newPurchaseInvoiceSection, setNewPurchaseInvoiceSection] =
    useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [stockDetails, setStockDetails] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sectionType = useStockType();

  useEffect(() => {
    setResData(purchaseInvoices);
  }, [purchaseInvoices]);

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

  async function removeInvoice(id) {
    if (!confirm("Are you sure you want to delete this invoice?")) {
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/newPurchaseInvoice`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, sectionType }),
      });

      const result = await response.json();
      if (result.success) {
        setActiveIndex(null);
        setPurchaseInvoices((prevs) =>
          prevs.filter((invoice) => invoice._id !== id)
        );
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    setIsDeleting(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {newPurchaseInvoiceSection && (
        <PharmacySectionComponent
          setNewPurchaseInvoiceSection={setNewPurchaseInvoiceSection}
          setPurchaseInvoices={setPurchaseInvoices}
          FormComponent={NewPurchaseInvoice}
          // editInvoice={editInvoice}
          // setEditInvoice={setEditInvoice}
        />
      )}
      {stockDetails && (
        <StockDetails
          stockDetails={stockDetails}
          setStockDetails={setStockDetails}
        />
      )}
      <Navbar route={["Pharmacy Invoice"]} />
      <div className="px-2 lg:px-4 w-full md:w-4/5 lg:w-3/4 mx-auto flex-1">
        <div className="h-16 py-2 flex justify-center gap-2 items-center">
          <input
            type="text"
            placeholder="Search"
            // onChange={(e) => {
            //   updatedata(e.target.value);
            // }}
            className="h-full w-full my-3 text-black text-xl font-medium px-4 rounded-full outline-none bg-gray-300 border-b-2 border-gray-400 focus:bg-gray-400"
          />
          {
            <button
              onClick={() => {
                setNewPurchaseInvoiceSection(
                  (newPurchaseInvoiceSection) => !newPurchaseInvoiceSection
                );
              }}
              className="flex justify-center items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 h-full rounded-full font-semibold"
            >
              <IoCreate className="size-6" />
              <div>Add</div>
            </button>
          }
        </div>
        <div className="h-12 flex justify-center items-center text-xl rounded-full w-full px-2 md:w-4/5 lg:w-3/4 mx-auto bg-black text-white">
          List of all the Purchase Invoices
        </div>
        <div className="flex flex-wrap justify-center items-center mx-auto">
          {resData.length > 0 ? (
            resData.map((invoice, index) => (
              <div
                key={index}
                className="text-black w-full px-2 md:w-4/5 lg:w-3/4 mx-auto"
              >
                <div
                  className="px-4 py-2 cursor-pointer border-b-2 border-gray-300 hover:rounded-full hover:bg-gray-300 flex justify-between items-center"
                  onClick={() =>
                    setActiveIndex(activeIndex === index ? null : index)
                  }
                >
                  <div className="">{index + 1}</div>
                  <h3 className="font-semibold text-lg capitalize">
                    {invoice.manufacturer
                      ? invoice.manufacturer.name
                      : invoice.vendor.name}
                  </h3>
                  <div className="">{invoice.invoiceNumber}</div>
                  <div className="flex justify-center items-center gap-2">
                    {invoice.isPaid ? (
                      <FaCheckCircle className="text-green-600 size-5" />
                    ) : (
                      <FaFileInvoiceDollar className="text-red-600 size-6" />
                    )}
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
                        Invoice Date:{" "}
                        <span className="text-blue-500 font-semibold uppercase">
                          {formatDateToIST(invoice.invoiceDate)}
                        </span>
                      </div>
                      <div className="py-1 px-4 ">
                        Received Date:{" "}
                        <span className="text-blue-500 font-semibold uppercase">
                          {formatDateToIST(invoice.receivedDate)}
                        </span>
                      </div>
                      <div className="py-1 px-4 ">
                        Created At:{" "}
                        <span className="text-blue-500 font-semibold uppercase">
                          {formatDateTimeToIST(invoice.createdAt)}
                        </span>
                      </div>
                    </div>
                    {/* <div className="max-h-80 overflow-y-auto">
                      {invoice.medicines.map((medicine, it) => {
                        const calculateTotalAllocated =
                          medicine.allocatedStock.reduce(
                            (totals, stock) => {
                              totals.strips += stock.quantity.strips;
                              totals.tablets += stock.quantity.tablets;
                              return totals;
                            },
                            { strips: 0, tablets: 0 }
                          );

                        return (
                          <div
                            className="border-b-2 w-full mx-auto border-gray-300 flex flex-wrap"
                            key={it}
                          >
                            <div className="w-1/3 p-2 text-center">
                              {medicine.medicineId.name}
                            </div>
                            <div className="w-1/3 p-2 text-center">
                              {medicine.medicineId.salts.name}
                            </div>
                            <div className="w-1/3 p-2 text-center">
                              {(calculateTotalAllocated.strips
                                ? calculateTotalAllocated.strips + " Strips"
                                : "") +
                                " " +
                                (calculateTotalAllocated.tablets
                                  ? calculateTotalAllocated.tablets + " Tablets"
                                  : "")}
                            </div>
                          </div>
                        );
                      })}
                    </div> */}
                    <div className="flex justify-between items-center gap-2 mt-3">
                      {accessInfo?.accessRole === "admin" ? (
                        <button
                          className="py-1 px-2 text-sm text-white bg-red-600 disabled:bg-gray-600 rounded-lg font-semibold flex gap-1 items-center"
                          onClick={() => {
                            removeInvoice(invoice._id);
                          }}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      ) : (
                        <div className="text-red-600">
                          Contact admin to delete the invoice.
                        </div>
                      )}
                      <button
                        className="py-1 px-2 text-sm text-white bg-blue-600 disabled:bg-gray-600 rounded-lg font-semibold flex gap-1 items-center"
                        onClick={() => {
                          setStockDetails(invoice);
                        }}
                      >
                        View Stock Details
                      </button>
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

export default PurchaseInvoiceSearchList;
