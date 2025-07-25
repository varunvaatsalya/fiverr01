"use client";
import React, { useEffect, useState } from "react";
import AddSection from "./AddSection";
import NewPrescriptionForm from "./NewPrescriptionForm";
import EditPrescriptionForm from "./EditPrescriptionForm";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { IoPersonAdd } from "react-icons/io5";
import { formatDateTimeToIST } from "../utils/date";
import Invoice from "./Invoice";
import Report from "./Report";
import AdvPrescSearch from "./AdvPrescSearch";
import BlankPrescription from "./BlankPrescription";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

function PrescriptionsSearchList({
  prescriptions,
  setPrescriptions,
  accessInfo,
  page,
  setPage,
  totalPages,
}) {
  const [searchedPrescription, setSearchedPrescription] = useState(null);
  const [copyPrescriptions, setCopyPrescriptions] = useState(prescriptions);

  const [newUserSection, setNewUserSection] = useState(false);
  const [resData, setResData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [printPrescription, setPrintPrescription] = useState(null);
  const [printReport, setPrintReport] = useState(null);
  const [blankPrescPrint, setBlankPrescPrint] = useState(null);
  const [editPrescription, setEditPrescription] = useState(null);
  const [advSearch, setAdvSearch] = useState(false);

  useEffect(() => {
    setResData(copyPrescriptions);
  }, [copyPrescriptions]);

  // useEffect(() => {
  //   if (
  //     accessInfo?.accessRole === "admin" ||
  //     accessInfo?.accessRole === "salesman"
  //   ) {
  //     setNewUserSection(true);
  //   }
  // }, [prescriptions]);

  useEffect(() => {
    if (searchedPrescription) {
      setCopyPrescriptions(searchedPrescription);
    } else {
      setCopyPrescriptions(prescriptions);
    }
  }, [searchedPrescription, prescriptions]);

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

  const hasOPDItem = (items) => {
    return items.some((item) => item.name.toLowerCase().includes("opd"));
  };

  function updatedata(query) {
    let filterRes = copyPrescriptions.filter((prescription) => {
      let lowerCaseQuery = query.toLowerCase();
      let isPrescriptionMatch =
        prescription.pid.toLowerCase().includes(lowerCaseQuery) ||
        prescription.patient.name.toLowerCase().includes(lowerCaseQuery) ||
        prescription.patient.uhid.toLowerCase().includes(lowerCaseQuery) ||
        prescription.doctor.name.toLowerCase().includes(lowerCaseQuery) ||
        prescription.department.name.toLowerCase().includes(lowerCaseQuery);
      let isItemMatch = prescription.items.some(
        (item) =>
          item.name.toLowerCase().includes(lowerCaseQuery) ||
          item.price.toString().includes(lowerCaseQuery)
      );
      return isPrescriptionMatch || isItemMatch;
    });

    // user.phone.toString().includes
    setResData(filterRes);
  }
  if (printPrescription) {
    return (
      <>
        <div className="bg-white h-full">
          <Invoice
            printPrescription={printPrescription}
            setPrintPrescription={setPrintPrescription}
          />
        </div>
      </>
    );
  }
  if (printReport) {
    return (
      <div className="bg-white h-full">
        <Report printReport={printReport} setPrintReport={setPrintReport} />
      </div>
    );
  }
  if (blankPrescPrint) {
    return (
      <div className="bg-white h-full">
        <BlankPrescription
          blankPrescPrint={blankPrescPrint}
          setBlankPrescPrint={setBlankPrescPrint}
        />
      </div>
    );
  }
  return (
    <>
      {newUserSection ? (
        <AddSection
          setNewUserSection={setNewUserSection}
          setPrintPrescription={setPrintPrescription}
          setEntity={setPrescriptions}
          FormComponent={
            editPrescription ? EditPrescriptionForm : NewPrescriptionForm
          }
          editPrescription={editPrescription}
          setEditPrescription={setEditPrescription}
        />
      ) : (
        <></>
      )}
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar route={["Invoices"]} />
        <main className="flex-grow">
          <div className="px-2 lg:px-4 max-w-screen-xl mx-auto">
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
                accessInfo?.accessRole === "salesman") && (
                <button
                  onClick={() => {
                    setNewUserSection((newUserSection) => !newUserSection);
                  }}
                  className="flex justify-center items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 h-full rounded-full font-semibold"
                >
                  <IoPersonAdd />
                  <div>Add</div>
                </button>
              )}
            </div>
            <div className="h-12 flex justify-center items-center text-xl rounded-full w-full px-2 md:w-4/5 mx-auto bg-black text-white">
              List of all the Invoices/Reports
            </div>
            <div className="flex flex-wrap justify-center items-center mx-auto py-1">
              {resData.map((prescription, index) => (
                <div
                  key={index}
                  className="text-black w-full px-2 md:w-4/5 mx-auto"
                >
                  {/* Patient Header */}
                  <div
                    className="px-4 py-2 cursor-pointer border-b-2 border-gray-300 hover:rounded-full hover:bg-gray-300 flex justify-between items-center"
                    onClick={() =>
                      setActiveIndex(activeIndex === index ? null : index)
                    }
                  >
                    <div className="">{index + 1}</div>
                    <h3 className="font-semibold text-lg capitalize">
                      {prescription.patient?.name}
                    </h3>
                    <div className="">{prescription.pid}</div>
                    <span className="text-gray-500 flex gap-1 items-center">
                      {(accessInfo?.accessRole === "admin" ||
                        accessInfo?.accessRole === "owner") &&
                        prescription.__v > 0 && (
                          <div className="rounded-full py-1 px-2 text-xs font-semibold bg-gray-300 text-gray-900">
                            Edited
                          </div>
                        )}
                      {activeIndex === index ? "-" : "+"}
                    </span>
                  </div>

                  {/* Patient Items (Shown when expanded) */}
                  {activeIndex === index && (
                    <div className="w-full px-3 pb-3 bg-gray-200 rounded-b-xl ">
                      <div className="flex flex-wrap gap-x-4 justify-around border-b-2 border-gray-400 py-2">
                        <div className="py-1 px-4 ">
                          UHID:{" "}
                          <span className="text-blue-500 font-semibold">
                            {prescription.patient?.uhid}
                          </span>
                        </div>
                        <div className="py-1 px-4 ">
                          Doctor:{" "}
                          <span className="text-blue-500 font-semibold">
                            {prescription.doctor.name}
                          </span>
                        </div>
                        <div className="py-1 px-4 ">
                          Department:{" "}
                          <span className="text-blue-500 font-semibold capitalize">
                            {prescription.department.name}
                          </span>
                        </div>
                        <div className="py-1 px-4 ">
                          Payment Mode:{" "}
                          <span className="text-blue-500 font-semibold capitalize">
                            {prescription.paymentMode}
                          </span>
                          {prescription.paymentMode === "mixed" && (
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
                                {prescription.payments.map((p, i) => (
                                  <div key={i} className="text-gray-700">
                                    {p.type}: ₹{p.amount}
                                  </div>
                                ))}
                              </HoverCardContent>
                            </HoverCard>
                          )}
                        </div>
                        <div className="py-1 px-4 ">
                          Create At:{" "}
                          <span className="text-blue-500 font-semibold uppercase">
                            {formatDateTimeToIST(prescription.createdAt)}
                          </span>
                        </div>
                        {prescription.createdByRole && (
                          <div className="py-1 px-4 ">
                            Created By Role:{" "}
                            <span className="text-blue-500 font-semibold capitalize">
                              {prescription.createdByRole}
                            </span>
                          </div>
                        )}
                        {prescription.createdBy &&
                          prescription.createdByRole !== "admin" && (
                            <div className="py-1 px-4 ">
                              Created By Name:{" "}
                              <span className="text-blue-500 font-semibold capitalize">
                                {prescription.createdBy?.name}
                              </span>
                            </div>
                          )}
                      </div>
                      {prescription.items.map((item, it) => {
                        // Find the test that matches the current item name, if any
                        const matchingTest = prescription.tests.find(
                          (test) => test.test.name === item.name
                        );

                        return (
                          <div
                            className="border-b-2 w-4/5 mx-auto border-gray-300 flex"
                            key={it}
                          >
                            <div className="w-1/2 p-2 text-center">
                              {item.name}
                            </div>
                            <div className="w-1/2 p-2 text-center">
                              {item.price}
                            </div>
                            <div className="w-1/2 p-2 text-center">
                              {/* Display "Pending" or "Completed" based on isCompleted status */}
                              {matchingTest ? (
                                matchingTest.isCompleted ? (
                                  <span className="text-green-700 flex justify-center items-center gap-1">
                                    <span>Completed</span>
                                  </span>
                                ) : (
                                  <span className="text-red-500">Pending</span>
                                )
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex justify-around items-center gap-2 mt-3">
                        {((!prescription.isPrint &&
                          accessInfo?.accessEditPermission) ||
                          accessInfo?.accessRole === "admin") && (
                          <button
                            className="py-2 px-4 text-white bg-blue-900 rounded-lg font-semibold flex gap-1 items-center"
                            onClick={() => {
                              setEditPrescription(prescription);
                              setNewUserSection((prev) => !prev);
                            }}
                          >
                            Edit
                          </button>
                        )}
                        {prescription.isPrint && (
                          <div className="text-sm text-black text-center">
                            Prescription has been printed
                          </div>
                        )}
                        {hasOPDItem(prescription.items) && (
                          <button
                            className="py-2 px-4 text-white bg-green-900 rounded-lg font-semibold flex gap-1 items-center"
                            onClick={() => {
                              setBlankPrescPrint(prescription);
                            }}
                          >
                            Blank Presc.
                          </button>
                        )}
                        {prescription.tests.some(
                          (test) => test.isCompleted
                        ) && (
                          <button
                            className="py-2 px-4 text-white bg-yellow-900 rounded-lg font-semibold flex gap-1 items-center"
                            onClick={() => {
                              setPrintReport(prescription._id);
                            }}
                          >
                            Report Print
                          </button>
                        )}
                        {(accessInfo?.accessRole === "admin" ||
                          accessInfo?.accessRole === "salesman") && (
                          <button
                            className="py-2 px-4 text-white bg-slate-900 rounded-lg font-semibold flex gap-1 items-center"
                            onClick={() => {
                              setPrintPrescription(prescription);
                            }}
                          >
                            Print
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
        <div className="flex justify-end gap-2 pr-4 ">
          <div
            className="px-4 py-3 bg-gray-900 text-white text-lg rounded-lg font-bold cursor-pointer"
            onClick={() => {
              if (advSearch) {
                setSearchedPrescription(null);
              }
              setAdvSearch(!advSearch);
            }}
          >
            {advSearch ? "Close" : "Advanced Search"}
          </div>
          {!advSearch && (
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
          )}
        </div>
        {advSearch && (
          <AdvPrescSearch setSearchedPrescription={setSearchedPrescription} />
        )}
        <Footer />
      </div>
    </>
  );
}

export default PrescriptionsSearchList;
