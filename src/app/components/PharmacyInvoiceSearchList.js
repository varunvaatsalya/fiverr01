"use client";
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import PharmacySectionComponent from "./PharmacySectionComponent";
import InvoicePharmacy from "./InvoicePharmacy";
import AdvPharmacyInvoiceSearch from "./AdvPharmacyInvoiceSearch";
import { AiFillMedicineBox } from "react-icons/ai";
import { IoCreate } from "react-icons/io5";
import NewPharmacyInvoice from "./NewPharmacyInvoice";
import EditPharmacyInvoice from "./EditPharmacyInvoice";
import ReturnInvoice from "./ReturnInvoice";
import { formatDateTimeToIST } from "../utils/date";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import MedicineDetailsSection from "./MedicineDetailsSection";
import { FaCheckCircle } from "react-icons/fa";
import { MdAssignmentReturned } from "react-icons/md";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

function PharmacyInvoiceSearchList({
  page,
  setPage,
  totalPages,
  invoices,
  setInvoices,
  isReturn,
  setIsReturn,
  accessInfo,
  isLoading,
}) {
  const [resData, setResData] = useState([]);
  const [copyInvoices, setCopyInvoices] = useState([]);
  const [searchedInvoices, setSearchedInvoices] = useState(null);
  const [newInvoiceSection, setNewInvoiceSection] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [returnInvoice, setReturnInvoice] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [medicineDetails, setMedicineDetails] = useState(null);
  const [medicineDetailsSection, setMedicineDetailsSection] = useState(false);
  const [printInvoice, setPrintInvoice] = useState(null);
  const [advSearch, setAdvSearch] = useState(false);

  function updatedata(query) {
    let filterRes = copyInvoices.filter((invoice) => {
      let lowerCaseQuery = query.toLowerCase();
      return (
        invoice.patientId?.uhid.toLowerCase().includes(lowerCaseQuery) ||
        invoice.patientId?.name?.toLowerCase().includes(lowerCaseQuery) ||
        invoice.inid.toLowerCase().includes(lowerCaseQuery) ||
        invoice.paymentMode.toLowerCase().includes(lowerCaseQuery)
      );
    });
    setResData(filterRes);
  }

  useEffect(() => {
    setResData(copyInvoices);
  }, [copyInvoices]);

  useEffect(() => {
    if (searchedInvoices) {
      setCopyInvoices(searchedInvoices);
    } else {
      setCopyInvoices(invoices);
    }
  }, [searchedInvoices, invoices]);

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

  if (
    accessInfo &&
    accessInfo.accessRole === "stockist" &&
    !accessInfo.accessEditPermission
  ) {
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
            // prescriptionPrinted={prescriptionPrinted}
          />
        </div>
      </>
    );
  }

  if (returnInvoice) {
    return (
      <>
        <div className="bg-white h-full">
          <ReturnInvoice
            returnInvoice={returnInvoice}
            setReturnInvoice={setReturnInvoice}
            setInvoices={setInvoices}
            accessInfo={accessInfo}
          />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {newInvoiceSection ? (
        <PharmacySectionComponent
          setNewInvoiceSection={setNewInvoiceSection}
          setPrintInvoice={setPrintInvoice}
          setInvoices={setInvoices}
          FormComponent={editInvoice ? EditPharmacyInvoice : NewPharmacyInvoice}
          editInvoice={editInvoice}
          setEditInvoice={setEditInvoice}
        />
      ) : (
        <></>
      )}
      <Navbar route={["Pharmacy Invoice"]} />
      <div className="px-2 lg:px-4 w-full md:w-4/5 mx-auto flex-1">
        <div className="h-16 py-2 flex justify-center gap-2 items-center">
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => {
              updatedata(e.target.value);
            }}
            className="h-full w-full my-3 text-black text-xl font-medium px-4 rounded-full outline-none bg-gray-300 border-b-2 border-gray-400 focus:bg-gray-400"
          />
          {(accessInfo?.accessRole === "admin" ||
            accessInfo?.accessRole === "salesman" ||
            (accessInfo?.accessRole === "dispenser" &&
              accessInfo.accessEditPermission)) && (
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
        <div className="flex gap-2 items-center">
          <div className="h-12 flex justify-center items-center text-xl rounded-full w-full px-2 mx-auto bg-black text-white">
            List of all the Pharmacy Invoices
          </div>
          <button
            onClick={() => {
              setIsReturn(!isReturn);
              setPage(1);
            }}
            disabled={isLoading || advSearch}
            className="h-12 flex justify-center items-center gap-2 text-xl rounded-full px-6 bg-black text-white"
          >
            {isReturn && <FaCheckCircle />}
            <div>{isLoading ? "Wait..." : "Return"}</div>
          </button>
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
                    {invoice.returns.length > 0 && (
                      <MdAssignmentReturned className="text-red-600 size-6" />
                    )}
                    {!invoice.isDelivered && (
                      <AiFillMedicineBox className="text-yellow-600 size-6" />
                    )}
                    <span className="text-gray-500">
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
                        Payment Mode:{" "}
                        <span className="text-blue-500 font-semibold">
                          {invoice.paymentMode}
                        </span>
                        {invoice.paymentMode === "Credit-Doctor" && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button size="sm" variant="outline" className="mx-1">Reason</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {invoice.comments || "No reason provided"}
                              </p>
                            </PopoverContent>
                          </Popover>
                        )}
                        {invoice.paymentMode === "mixed" && (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <button className="text-red-500 text-xs font-bold border rounded-full px-2 py-[1px] bg-red-300 hover:bg-red-200 transition">
                                i
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent className="text-sm bg-white border shadow-lg rounded-lg p-2">
                              <div className="font-semibold mb-1 text-gray-800">
                                Payment Breakdown:
                              </div>
                              {invoice.payments.map((p, i) => (
                                <div key={i} className="text-gray-700">
                                  {p.type}: ₹{p.amount}
                                </div>
                              ))}
                            </HoverCardContent>
                          </HoverCard>
                        )}
                      </div>
                      {invoice.price.discount && (
                        <>
                          <div className="py-1 px-4 ">
                            Subtotal:{" "}
                            <span className="text-blue-500 font-semibold">
                              {invoice.price.subtotal}
                            </span>
                          </div>
                          <div className="py-1 px-4 ">
                            Discount:{" "}
                            <span className="text-blue-500 font-semibold">
                              {invoice.price.discount + "%"}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="py-1 px-4 ">
                        Total:{" "}
                        <span className="text-blue-500 font-semibold">
                          {invoice.price.total}
                        </span>
                      </div>
                      <div className="py-1 px-4 ">
                        Create At:{" "}
                        <span className="text-blue-500 font-semibold uppercase">
                          {formatDateTimeToIST(invoice.createdAt)}
                        </span>
                      </div>
                      {invoice.createdByRole && (
                        <div className="py-1 px-4 ">
                          Created By Role:{" "}
                          <span className="text-blue-500 font-semibold capitalize">
                            {invoice.createdByRole}
                          </span>
                        </div>
                      )}
                      {invoice.createdBy &&
                        invoice.createdByRole !== "admin" && (
                          <div className="py-1 px-4 ">
                            Created By Name:{" "}
                            <span className="text-blue-500 font-semibold capitalize">
                              {invoice.createdBy?.name}
                            </span>
                          </div>
                        )}
                      {invoice.isDelivered && (
                        <div className="py-1 px-4 ">
                          Delivered At:{" "}
                          <span className="text-blue-500 font-semibold uppercase">
                            {formatDateTimeToIST(invoice.isDelivered)}
                          </span>
                        </div>
                      )}
                    </div>
                    {invoice.returns.length > 0 && (
                      <div className="text-center text-red-600 font-sembold flex gap-1 items-center justify-center">
                        <MdAssignmentReturned className="size-4" />
                        <div className="font-semibold">
                          Medicines has been returned in this invoice!
                        </div>
                      </div>
                    )}
                    <div className="max-h-80 overflow-y-auto">
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
                            className="border-b-2 w-full mx-auto text-sm border-gray-300 flex flex-wrap"
                            key={it}
                          >
                            <div className="w-10 p-2 text-center">
                              {it + 1 + "."}
                            </div>
                            <div className="w-1/3 p-2 text-center">
                              {medicine.medicineId.name}
                            </div>
                            <div className="flex-1 p-2 text-center">
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
                    </div>
                    <div className="flex justify-around items-center gap-2 mt-3">
                      {(accessInfo?.accessRole === "dispenser" ||
                        accessInfo?.accessRole === "salesman" ||
                        accessInfo?.accessEditPermission) &&
                        invoice.isDelivered && (
                          <button
                            className="py-2 px-4 text-white bg-blue-900 rounded-lg font-semibold flex gap-1 items-center"
                            onClick={() => {
                              setReturnInvoice(invoice);
                            }}
                          >
                            Return
                          </button>
                        )}
                      {invoice.isPrint && (
                        <div className="text-sm text-black text-center">
                          invoice has been printed
                        </div>
                      )}
                      {medicineDetailsSection && (
                        <MedicineDetailsSection
                          medicineDetails={medicineDetails}
                          setMedicineDetails={setMedicineDetails}
                          setMedicineDetailsSection={setMedicineDetailsSection}
                        />
                      )}
                      {(accessInfo?.accessRole === "admin" ||
                        accessInfo?.accessRole === "salesman" ||
                        (accessInfo?.accessRole === "dispenser" &&
                          accessInfo.accessEditPermission)) &&
                        invoice.paymentMode !== "Credit-Others" && (
                          <button
                            className="py-2 px-4 text-white bg-fuchsia-900 rounded-lg font-semibold flex gap-1 items-center"
                            onClick={() => {
                              setEditInvoice(invoice);
                              setNewInvoiceSection(true);
                            }}
                          >
                            Edit
                          </button>
                        )}
                      <button
                        className="py-2 px-4 text-white bg-pink-900 rounded-lg font-semibold flex gap-1 items-center"
                        onClick={() => {
                          setMedicineDetails(invoice);
                          setMedicineDetailsSection(true);
                        }}
                      >
                        Details
                      </button>
                      {(accessInfo?.accessRole === "admin" ||
                        accessInfo?.accessRole === "salesman" ||
                        accessInfo?.accessRole === "dispenser") && (
                        <button
                          className="py-2 px-4 text-white bg-slate-900 rounded-lg font-semibold flex gap-1 items-center"
                          onClick={() => {
                            setPrintInvoice(invoice);
                          }}
                        >
                          Print
                        </button>
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
        <div
          className="px-4 py-3 bg-gray-900 text-white text-lg rounded-lg font-bold cursor-pointer"
          onClick={() => {
            if (advSearch) {
              setSearchedInvoices(null);
            }
            setIsReturn(false);
            setPage(1);
            setAdvSearch(!advSearch);
          }}
        >
          {advSearch ? "Close" : "Advanced Search"}
        </div>
        {!advSearch && (
          <div className="bg-gray-900 text-white rounded-lg">
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
        )}
      </div>
      {advSearch && (
        <AdvPharmacyInvoiceSearch setSearchedInvoices={setSearchedInvoices} />
      )}
    </div>
  );
}

export default PharmacyInvoiceSearchList;
