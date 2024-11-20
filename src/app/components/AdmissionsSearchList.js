"use client";
import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaArrowLeft, FaArrowRight, FaDotCircle } from "react-icons/fa";
import Link from "next/link";

function AdmissionsSearchList({
  tag,
  link,
  admissions,
  page,
  setPage,
}) {
  const [resData, setResData] = useState([]);


  const handleNextPage = () => {
    if (admissions?.length >= 50) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };


  function updatedata(query) {
    let lowerCaseQuery = query.toLowerCase();
    let filterRes = admissions.filter((admission) => {
      return (
        admission.patientId.name.toLowerCase().includes(lowerCaseQuery) ||
        admission.patientId.uhid.toLowerCase().includes(lowerCaseQuery)
      );
    });
  
    setResData(filterRes);
  }
  

  return (
    <>
      {/* {newUserSection ? (
        <AddSection
          setNewUserSection={setNewUserSection}
          setEntity={setPrescriptions}
          FormComponent={
            editPrescription ? EditPrescriptionForm : NewPrescriptionForm
          }
          editPrescription={editPrescription}
          setEditPrescription={setEditPrescription}
        />
      ) : (
        <></>
      )} */}
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar route={[tag]} />
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
            <div className="h-12 flex justify-center items-center text-xl rounded-full w-full px-2 md:w-4/5 lg:w-3/4 mx-auto bg-black text-white">
              List of all the Invoices/Reports
            </div>
            <div className="flex flex-wrap justify-center items-center mx-auto py-4">
              {admissions.map((admission, index) => (
                <Link
                href={`${link}/${admission._id}`}
                  key={index}
                  className="text-black w-full px-2 md:w-4/5 lg:w-3/4 mx-auto"
                >
                  {/* Patient Header */}
                  <div className="px-4 py-2 cursor-pointer border-b-2 border-gray-300 hover:rounded-full hover:bg-gray-300 flex justify-between items-center">
                    <div className="">{index + 1}</div>
                    <h3 className="font-semibold text-lg capitalize">
                      {admission.patientId?.name}
                    </h3>
                    <div className="">{admission.patientId?.uhid}</div>
                    <div className={admission.isCompleted?'text-green-500':'text-red-500'}><FaDotCircle className='size-5'/></div>
                  </div>
                </Link>
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
              disabled={admissions?.length < 50}
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

export default AdmissionsSearchList;
