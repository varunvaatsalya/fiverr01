"use client";
import React, { useMemo, useState } from "react";
import Navbar from "./Navbar";
import PharmacySectionComponent from "./PharmacySectionComponent";
import NewPurchaseInvoice from "./NewPurchaseInvoice";
import AdvPurchaseInvoiceSearch from "./AdvPurchaseInvoiceSearch";
import StockDetails from "./StockDetails";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { FaCheckCircle, FaFileInvoiceDollar } from "react-icons/fa";
import { useStockType } from "../context/StockTypeContext";
import { format } from "date-fns";

function PurchaseInvoiceSearchList({
  page,
  setPage,
  totalPages,
  purchaseInvoices,
  setPurchaseInvoices,
  accessInfo,
}) {
  const [newPurchaseInvoiceSection, setNewPurchaseInvoiceSection] =
    useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [stockDetails, setStockDetails] = useState(null);
  const [searchedPurchaseInvoices, setSearchedPurchaseInvoices] =
    useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [advSearch, setAdvSearch] = useState(false);

  const copyInvoices = useMemo(() => {
    return searchedPurchaseInvoices
      ? searchedPurchaseInvoices
      : purchaseInvoices;
  }, [searchedPurchaseInvoices, purchaseInvoices]);

  const sectionType = useStockType();

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
        setPurchaseInvoices((prevs) =>
          prevs.filter((invoice) => invoice._id !== id)
        );
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    setIsDeleting(false);
  }

  const formatDate = (date) => {
    if (!date) return "-";
    return format(new Date(date), "dd-MM-yyyy");
  };

  // date + precise time
  const formatDateTime = (date) => {
    if (!date) return "-";
    return format(new Date(date), "dd-MM-yyyy hh:mm:ss a");
  };

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
      <Navbar route={["Purchase Invoice"]} />
      <div className="px-2 lg:px-4 w-full md:w-4/5 mx-auto flex-1">
        <div className="h-12 py-1 flex justify-center gap-2 items-center">
          <input
            type="text"
            placeholder="Search"
            className="h-9 w-full md:w-1/2 text-black text-sm px-3 rounded-md outline-none bg-gray-200 border border-gray-400 focus:bg-gray-300"
          />
        </div>
        <div className="h-9 flex justify-center items-center text-base rounded-md w-full md:w-4/5 lg:w-3/4 mx-auto bg-black text-white font-medium">
          List of all the Purchase Invoices
        </div>
        <div className="flex flex-wrap justify-center items-center mx-auto">
          {copyInvoices.length > 0 ? (
            <table className="w-full text-sm border border-gray-300 text-black">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">#</th>
                  <th className="border px-2 py-1">Manufacturer/Vendor</th>
                  <th className="border px-2 py-1">Invoice No</th>
                  <th className="border px-2 py-1">Invoice Date</th>
                  <th className="border px-2 py-1">Received Date</th>
                  <th className="border px-2 py-1">Created At</th>
                  <th className="border px-2 py-1">Created By</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {copyInvoices.map((invoice, index) => (
                  <tr key={invoice._id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1 text-center">
                      {index + 1}
                    </td>
                    <td className="border px-2 py-1 capitalize">
                      {invoice.manufacturer
                        ? invoice.manufacturer?.name
                        : invoice.vendor?.name}
                    </td>
                    <td className="border px-2 py-1">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="border px-2 py-1">
                      {formatDate(invoice.invoiceDate)}
                    </td>
                    <td className="border px-2 py-1">
                      {formatDate(invoice.receivedDate)}
                    </td>
                    <td className="border px-2 py-1">
                      {formatDateTime(invoice.createdAt)}
                    </td>

                    <td className="border px-2 py-1">
                      {invoice.createdByRole === "admin"
                        ? "Admin"
                        : invoice.createdBy?.name || "-"}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {invoice.isPaid ? (
                        <FaCheckCircle className="text-green-600 mx-auto" />
                      ) : (
                        <FaFileInvoiceDollar className="text-red-600 mx-auto" />
                      )}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <div className="flex justify-center gap-2">
                        {/* Always visible */}
                        <button
                          className="py-0.5 px-2 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
                          onClick={() => setStockDetails(invoice)}
                        >
                          View
                        </button>

                        {/* Delete toggle - only for admin */}
                        {accessInfo?.accessRole === "admin" && (
                          <>
                            {expandedRow === invoice._id ? (
                              <>
                                <button
                                  className="py-0.5 px-2 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                                  onClick={() => removeInvoice(invoice._id)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? "..." : "Delete"}
                                </button>
                                <button
                                  className="py-0.5 px-2 text-xs bg-gray-300 rounded hover:bg-gray-400"
                                  onClick={() => setExpandedRow(null)}
                                >
                                  Close
                                </button>
                              </>
                            ) : (
                              <button
                                className="py-0.5 px-2 text-xs text-white bg-gray-700 rounded hover:bg-gray-800"
                                onClick={() => setExpandedRow(invoice._id)}
                              >
                                More
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500 font-semibold text-lg">
              *No Invoice Records
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 pr-4 mt-2">
        <div
          className="px-3 py-1 bg-gray-900 text-white text-sm rounded cursor-pointer"
          onClick={() => {
            if (advSearch) setSearchedPurchaseInvoices(null);
            setAdvSearch(!advSearch);
          }}
        >
          {advSearch ? "Close" : "Advanced Search"}
        </div>

        {!advSearch && (
          <div className="bg-gray-900 text-white rounded flex items-center text-sm">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="px-2 py-1 disabled:opacity-50"
            >
              <FaArrowLeft size={14} />
            </button>
            <span className="border-x border-white px-3 py-1">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="px-2 py-1 disabled:opacity-50"
            >
              <FaArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
      {advSearch && (
        <AdvPurchaseInvoiceSearch
          setSearchedPurchaseInvoices={setSearchedPurchaseInvoices}
        />
      )}
    </div>
  );
}

export default PurchaseInvoiceSearchList;
