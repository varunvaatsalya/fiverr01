"use client";
import React, { useEffect, useState } from "react";
import EditReportForm from "./EditReportForm";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import AddSection from "./AddSection";
import { formatDateTimeToIST } from "../utils/date";

function CompletedTestList({
  completedTests,
  setCompletedTests,
  page,
  setPage,
}) {
  const [newUserSection, setNewUserSection] = useState(false);
  const [resData, setResData] = useState(completedTests);
  const [activeIndex, setActiveIndex] = useState(null);
  const [editReport, setEditReport] = useState(null);

  useEffect(() => {
    setResData(completedTests);
  }, [completedTests]);

  const handleNextPage = () => {
    if (completedTests.length >= 50) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  function updatedata(query) {
    let filterRes = completedTests.filter((test) => {
      let lowerCaseQuery = query.toLowerCase();
      return (
        test.patientName.toLowerCase().includes(lowerCaseQuery) ||
        test.testName?.toLowerCase().includes(lowerCaseQuery) ||
        test.patientUHID.toLowerCase().includes(lowerCaseQuery) ||
        test.pid.toLowerCase().includes(lowerCaseQuery) ||
        test.testId.toLowerCase().includes(lowerCaseQuery)
      );
    });
    setResData(filterRes);
  }

  return (
    <>
      {newUserSection ? (
        <AddSection
          setNewUserSection={setNewUserSection}
          FormComponent={EditReportForm}
          editReport={editReport}
        />
      ) : (
        <></>
      )}
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar route={["Reports"]} />
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
            </div>
            <div className="h-12 flex justify-center items-center text-xl rounded-full w-3/4 mx-auto bg-black text-white">
              Reports Details
            </div>
            {resData.map((test, index) => {
              return (
                <div key={index} className="text-black md:w-3/4 mx-auto">
                  {/* test Header */}
                  <div
                    className="px-4 py-2 cursor-pointer border-b-2 border-gray-300 hover:rounded-full hover:bg-gray-300 flex justify-between items-center"
                    onClick={() =>
                      setActiveIndex(activeIndex === index ? null : index)
                    }
                  >
                    <div className="">{index + 1}</div>
                    <h3 className="font-semibold text-lg capitalize">
                      {test.patientName}
                    </h3>
                    <div className="capitalize">{test.testName}</div>
                    <span className="text-gray-500">
                      {activeIndex === index ? "-" : "+"}
                    </span>
                  </div>

                  {/* test Items (Shown when expanded) */}
                  {activeIndex === index && (
                    <div className="w-full p-2 bg-gray-200 rounded-b-xl ">
                      <div className="flex flex-wrap gap-2 justify-around border-b-2 border-gray-300 py-2">
                        <div className="py-1 px-4 ">
                          Invoice Id:{" "}
                          <span className="text-blue-500 font-semibold">
                            {test.pid}
                          </span>
                        </div>
                        <div className="py-1 px-4 ">
                          UHID:{" "}
                          <span className="text-blue-500 font-semibold capitalize">
                            {test.patientUHID}
                          </span>
                        </div>
                        <div className="py-1 px-4 ">
                          Result Data.:{" "}
                          <span className="text-blue-500 font-semibold">
                            {formatDateTimeToIST(test.resultDate)}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-around my-3">
                        {/* {accessInfo?.accessEditPermission && ( */}
                        <button
                          className="py-2 px-4 text-white bg-blue-900 rounded-lg font-semibold flex gap-1 items-center"
                          onClick={() => {
                            setEditReport(test);
                            setNewUserSection((prev) => !prev);
                          }}
                        >
                          Edit
                        </button>
                        {/* )} */}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
        <div className="flex justify-end pr-4 gap-3">
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
              disabled={completedTests.length < 50}
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

export default CompletedTestList;
