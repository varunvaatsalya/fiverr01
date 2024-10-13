"use client";
import React, { useEffect, useState } from "react";
import AddSection from "./AddSection";
import NewPrescriptionForm from "./NewPrescriptionForm";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { IoPersonAdd } from "react-icons/io5";
import { formatDateToIST } from "../utils/date";

function PrescriptionsSearchList({ prescriptions, setPrescriptions }) {
  const [newUserSection, setNewUserSection] = useState(false);
  const [resData, setResData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  //   const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    setResData(prescriptions);
    console.log(prescriptions);
  }, [prescriptions]);

  function updatedata(query) {
    console.log(query);
    let filterRes = prescriptions.filter((prescription) => {
      let lowerCaseQuery = query.toLowerCase();
      let isPrescriptionMatch =
        prescription.pid.toString().includes(lowerCaseQuery) ||
        prescription.prescription.name.toLowerCase().includes(lowerCaseQuery) ||
        prescription.prescription.uhid.toString().includes(lowerCaseQuery) ||
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
  return (
    <>
      {newUserSection ? (
        <AddSection
          setNewUserSection={setNewUserSection}
          setEntity={setPrescriptions}
          FormComponent={NewPrescriptionForm}
        />
      ) : (
        <></>
      )}
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar />
        <main className="flex-grow">
          <div className="px-2 lg:px-4 max-w-screen-xl mx-auto">
            <div className="h-16 py-2 flex justify-center gap-2 items-center">
              <input
                type="text"
                placeholder="Search"
                onChange={(e) => {
                  updatedata(e.target.value);
                }}
                className="h-full w-full my-3 text-black text-xl font-medium px-4 rounded-full outline-none bg-gray-300 border-b-2 border-gray-400 focus:bg-transparent"
              />
              <button
                onClick={() => {
                  setNewUserSection((newUserSection) => !newUserSection);
                }}
                className="flex justify-center items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 h-full rounded-full font-semibold"
              >
                <IoPersonAdd />
                <div>Add</div>
              </button>
            </div>
            <div className="h-12 flex justify-center items-center text-xl rounded-full w-3/4 mx-auto bg-black text-white">
              List of all the Prescriptions
            </div>
            <div className="flex flex-wrap justify-center items-center mx-auto p-4">
              {resData.map((prescription, index) => (
                <div key={index} className="text-black md:w-3/4 mx-auto">
                  {/* Patient Header */}
                  <div
                    className="px-4 py-2 cursor-pointer border-b-2 border-gray-300 hover:rounded-full hover:bg-gray-300 flex justify-between items-center"
                    onClick={() =>
                      setActiveIndex(activeIndex === index ? null : index)
                    }
                  >
                    <div className="">{index + 1}</div>
                    <h3 className="font-semibold text-lg capitalize">
                      {prescription.patient.name}
                    </h3>
                    <div className="">{prescription.pid}</div>
                    <span className="text-gray-500">
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
                            {prescription.patient.uhid}
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
                          Registration Date:{" "}
                          <span className="text-blue-500 font-semibold uppercase">
                            {formatDateToIST(prescription.createdAt)}
                          </span>
                        </div>
                        
                      </div>
                      {prescription.items.map((item, it) => {
                        return (
                          <div className="border-b-2 w-4/5 mx-auto border-gray-300 flex" key={it}>
                            <div className="w-1/2 p-2 text-center">{item.name}</div>
                            <div className="w-1/2 p-2 text-center">{item.price}</div>
                          </div>
                        );
                      })}
                      <button
                      className="py-2 px-4 text-white bg-slate-900 rounded-lg font-semibold flex gap-1 items-center mx-auto mt-2"
                    //   onClick={() => {
                    //     handleShowPatientPrescription(prescription._id);
                    //   }}
                    //   disabled={submitting}
                    >
                        Print
                      {/* {submitting ? <Loading size={15} /> : <></>}
                      {submitting ? "Showing..." : "Show Presriptions"} */}
                    </button>
                    </div>
                    
                  )}
                  
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default PrescriptionsSearchList;
