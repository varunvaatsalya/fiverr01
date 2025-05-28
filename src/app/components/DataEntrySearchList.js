"use client";
import React, { useEffect, useState } from "react";
import AddSection from "./AddSection";
import NewDataEntryForm from "./NewDataEntryForm";
// import ExpressInvoice from "./ExpressInvoice";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { IoPersonAdd } from "react-icons/io5";
import { formatDateTimeToIST } from "../utils/date";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Invoice from "./Invoice";
import NewPrescriptionForm from "./NewPrescriptionForm";

function DataEntrySearchList({
  dataEntrys,
  setDataEntrys,
  page,
  setPage,
  role,
}) {
  const [newUserSection, setNewUserSection] = useState(false);
  const [resData, setResData] = useState([]);
  const [invoiceGenerate, setInvoiceGenerate] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [printPrescription, setPrintPrescription] = useState(null);

  const handleNextPage = () => {
    if (dataEntrys.length >= 50) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  async function deleteDataEntry(id) {
    try {
      const response = await fetch(`/api/newDataEntry`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (result.success) {
        setDataEntrys((dataEntries) =>
          dataEntries.filter((dataEntry) => dataEntry._id !== id)
        );
      }
    } catch (error) {
      console.error("Error deleting Entry:", error);
    }
  }

  function updatedata(query) {
    let filterRes = dataEntrys.filter((dataEntry) => {
      let lowerCaseQuery = query.toLowerCase();
      let isDataEntryMatch =
        dataEntry.patient.name.toLowerCase().includes(lowerCaseQuery) ||
        dataEntry.patient.uhid.toLowerCase().includes(lowerCaseQuery) ||
        dataEntry.doctor.name.toLowerCase().includes(lowerCaseQuery) ||
        dataEntry.department.name.toLowerCase().includes(lowerCaseQuery);
      let isItemMatch = dataEntry.items.some(
        (item) =>
          item.name.toLowerCase().includes(lowerCaseQuery) ||
          item.price.toString().includes(lowerCaseQuery)
      );
      return isDataEntryMatch || isItemMatch;
    });
    setResData(filterRes);
  }
  useEffect(() => {
    updatedata("");
  }, [dataEntrys]);

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

  return (
    <>
      {newUserSection ? (
        <AddSection
          setNewUserSection={setNewUserSection}
          setEntity={setDataEntrys}
          expressData={invoiceGenerate}
          setPrintPrescription={setPrintPrescription}
          FormComponent={invoiceGenerate ? NewPrescriptionForm : NewDataEntryForm}
          deleteDataEntry={deleteDataEntry}
          setExpressData={setInvoiceGenerate}
        />
      ) : (
        <></>
      )}
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar route={["Data Entry"]} />
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
              {
                <button
                  onClick={() => {
                    setNewUserSection((newUserSection) => !newUserSection);
                  }}
                  className="flex justify-center items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 h-full rounded-full font-semibold"
                >
                  <IoPersonAdd />
                  <div>Add</div>
                </button>
              }
            </div>
            <div className="h-12 flex justify-center items-center text-xl rounded-full w-full px-2 md:w-4/5 lg:w-3/4 mx-auto bg-black text-white">
              List of all the Desk Entry
            </div>
            <div className="flex flex-wrap justify-center items-center mx-auto py-1">
              {resData.map((dataEntry, index) => (
                <div
                  key={index}
                  className="text-black w-full px-2 md:w-4/5 lg:w-3/4 mx-auto"
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
                      {dataEntry.patient?.name}
                    </h3>
                    <div className="">{dataEntry.patient?.uhid}</div>
                    <span className="text-gray-500">
                      {activeIndex === index ? "-" : "+"}
                    </span>
                  </div>

                  {/* Patient Items (Shown when expanded) */}
                  {activeIndex === index && (
                    <div className="w-full px-3 pb-3 bg-gray-200 rounded-b-xl ">
                      <div className="flex flex-wrap gap-x-4 justify-around border-b-2 border-gray-400 py-2">
                        <div className="py-1 px-4 ">
                          Doctor:{" "}
                          <span className="text-blue-500 font-semibold">
                            {dataEntry.doctor.name}
                          </span>
                        </div>
                        <div className="py-1 px-4 ">
                          Department:{" "}
                          <span className="text-blue-500 font-semibold capitalize">
                            {dataEntry.department.name}
                          </span>
                        </div>
                        <div className="py-1 px-4 ">
                          Create At:{" "}
                          <span className="text-blue-500 font-semibold uppercase">
                            {formatDateTimeToIST(dataEntry.createdAt)}
                          </span>
                        </div>
                      </div>
                      {dataEntry.items.map((item, it) => {
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
                          </div>
                        );
                      })}

                      <div className="flex justify-end items-center gap-2 mt-3">
                        <button
                          className="py-2 px-4 text-white bg-red-800 rounded-lg font-semibold flex gap-1 items-center"
                          onClick={() => {
                            deleteDataEntry(dataEntry._id);
                          }}
                        >
                          Delete
                        </button>
                        {(role == "admin" || role == "salesman") && (
                          <button
                            className="py-2 px-4 text-white bg-slate-800 rounded-lg font-semibold flex gap-1 items-center"
                            onClick={() => {
                              setInvoiceGenerate(dataEntry);
                              setNewUserSection(
                                (newUserSection) => !newUserSection
                              );
                            }}
                          >
                            Create Invoice
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
          <div className="bg-gray-900 rounded-lg">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="p-3"
            >
              <FaArrowLeft size={20} />
            </button>
            <span className="text-white border-x border-white p-3">
              Page {page}
            </span>
            <button
              onClick={handleNextPage}
              disabled={dataEntrys.length < 50}
              className="p-3"
            >
              <FaArrowRight size={20} />
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default DataEntrySearchList;
