"use client";
import React, { useEffect, useState } from "react";
import AddSection from "./AddSection";
import NewPrescriptionForm from "./NewPrescriptionForm";
import EditPrescriptionForm from "./EditPrescriptionForm";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { IoPersonAdd } from "react-icons/io5";
import { formatDateToIST } from "../utils/date";
import Invoice from "./Invoice";

function PrescriptionsSearchList({ prescriptions, setPrescriptions,accessInfo }) {
  const [newUserSection, setNewUserSection] = useState(false);
  const [resData, setResData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [printPrescription, setPrintPrescription] = useState(null);
  const [editPrescription, setEditPrescription] = useState(null);

  useEffect(() => {
    setResData(prescriptions);
    console.log(prescriptions);
  }, [prescriptions]);

  async function prescriptionPrinted(id) {
    if (printPrescription && !printPrescription.isPrint) {
      let result = await fetch(`/api/print?id=${id}`);
      result = await result.json();
      if (result.success) {
        console.log(result, id);
        setPrescriptions((prevPrescriptions) =>
          prevPrescriptions.map((prescription) =>
            prescription._id === result.id
              ? { ...prescription, isPrint: true }
              : prescription
          )
        );
      }
    }
  }

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
  if (printPrescription) {
    return (
      <>
        <div className="">
          <Invoice
            printPrescription={printPrescription}
            setPrintPrescription={setPrintPrescription}
            prescriptionPrinted={prescriptionPrinted}
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
                className="h-full w-full my-3 text-black text-xl font-medium px-4 rounded-full outline-none bg-gray-300 border-b-2 border-gray-400 focus:bg-gray-400"
              />
              {(accessInfo?.accessRole === "admin" ||
                accessInfo?.accessRole === "salesman") &&<button
                onClick={() => {
                  setNewUserSection((newUserSection) => !newUserSection);
                }}
                className="flex justify-center items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 h-full rounded-full font-semibold"
              >
                <IoPersonAdd />
                <div>Add</div>
              </button>}
            </div>
            <div className="h-12 flex justify-center items-center text-xl rounded-full w-full px-2 md:w-4/5 lg:w-3/4 mx-auto bg-black text-white">
              List of all the Prescriptions
            </div>
            <div className="flex flex-wrap justify-center items-center mx-auto py-4">
              {resData.map((prescription, index) => (
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
                          Create At:{" "}
                          <span className="text-blue-500 font-semibold uppercase">
                            {formatDateToIST(prescription.createdAt)}
                          </span>
                        </div>
                      </div>
                      {prescription.items.map((item, it) => {
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
                      <div className="flex justify-around items-center gap-2 mt-3">
                        {!prescription.isPrint && accessInfo?.accessEditPermission && (
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
                        <button
                          className="py-2 px-4 text-white bg-slate-900 rounded-lg font-semibold flex gap-1 items-center"
                          onClick={() => {
                            setPrintPrescription(prescription);
                          }}
                        >
                          Print
                        </button>
                      </div>
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
