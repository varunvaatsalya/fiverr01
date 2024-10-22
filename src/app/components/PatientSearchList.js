"use client";
import React, { useEffect, useState } from "react";
import AddSection from "./AddSection";
import NewPatientForm from "./NewPatientForm";
import EditPatientForm from "./EditPatientForm";
import PrescriptionList from "./PrescriptionList";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { formatDateTimeToIST } from "../utils/date";
import { IoPersonAdd } from "react-icons/io5";
import Loading from "./Loading";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

function PatientSearchList({
  patients,
  setPatients,
  accessInfo,
  page,
  totalPages,
  setPage,
}) {
  const [newUserSection, setNewUserSection] = useState(false);
  const [resData, setResData] = useState(patients);
  const [activeIndex, setActiveIndex] = useState(null);
  const [prescriptions, setPrescriptions] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editPatient, setEditPatient] = useState(null);

  useEffect(() => {
    setResData(patients);
  }, [patients]);

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

  function updatedata(query) {
    let filterRes = patients.filter((patient) => {
      let lowerCaseQuery = query.toLowerCase();
      return (
        patient.name.toLowerCase().includes(lowerCaseQuery) ||
        patient.fathersName.toLowerCase().includes(lowerCaseQuery) ||
        patient.uhid.toLowerCase().includes(lowerCaseQuery) ||
        patient.gender.toLowerCase().includes(lowerCaseQuery) ||
        patient.address.toLowerCase().includes(lowerCaseQuery) ||
        patient.aadharNumber?.toString().includes(lowerCaseQuery) ||
        patient.mobileNumber.toString().includes(lowerCaseQuery)
      );
    });
    setResData(filterRes);
  }

  async function handleShowPatientPrescription(id) {
    setSubmitting(true);
    try {
      let result = await fetch(`/api/newPrescription?patient=${id}`);
      result = await result.json();
      // Check if login was successful
      if (result.success) {
        let patientDetails = patients.find((patient) => patient._id == id);
        result.prescriptions.patientDetails = patientDetails;
        setPrescriptions(result.prescriptions);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
      setNewUserSection((prev) => !prev);
    }
  }

  return (
    <>
      {newUserSection ? (
        <AddSection
          setNewUserSection={setNewUserSection}
          setEntity={
            editPatient
              ? setPatients // Assuming you want to update patients
              : prescriptions
              ? setPrescriptions
              : setPatients
          }
          FormComponent={
            editPatient
              ? EditPatientForm // Create an EditPatientForm component for editing
              : prescriptions
              ? PrescriptionList
              : NewPatientForm
          }
          prescriptions={prescriptions}
          editPatient={editPatient}
          setEditPatient={setEditPatient}
        />
      ) : (
        <></>
      )}
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar route={["Patient"]} />
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
            <div className="h-12 flex justify-center items-center text-xl rounded-full w-3/4 mx-auto bg-black text-white">
              Patients Details
            </div>
            {resData.map((patient, index) => (
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
                    {patient.name}
                  </h3>
                  <div className="">{patient.uhid}</div>
                  <span className="text-gray-500">
                    {activeIndex === index ? "-" : "+"}
                  </span>
                </div>

                {/* Patient Items (Shown when expanded) */}
                {activeIndex === index && (
                  <div className="w-full p-2 bg-gray-200 rounded-b-xl ">
                    <div className="flex flex-wrap gap-2 justify-around border-b-2 border-gray-300 py-2">
                      <div className="py-1 px-4 ">
                        Age:{" "}
                        <span className="text-blue-500 font-semibold">
                          {patient.age}
                        </span>
                      </div>
                      <div className="py-1 px-4 ">
                        Gender:{" "}
                        <span className="text-blue-500 font-semibold capitalize">
                          {patient.gender}
                        </span>
                      </div>
                      {patient.fathersName && (
                        <div className="py-1 px-4 ">
                          Father's Name:{" "}
                          <span className="text-blue-500 font-semibold capitalize">
                            {patient.fathersName}
                          </span>
                        </div>
                      )}
                      <div className="py-1 px-4 ">
                        Mo No.:{" "}
                        <span className="text-blue-500 font-semibold capitalize">
                          {patient.mobileNumber}
                        </span>
                      </div>
                      {patient.aadharNumber && (
                        <div className="py-1 px-4 ">
                          Aadhar No.:{" "}
                          <span className="text-blue-500 font-semibold">
                            {patient.aadharNumber}
                          </span>
                        </div>
                      )}
                      <div className="py-1 px-4 ">
                        Registration Date:{" "}
                        <span className="text-blue-500 font-semibold uppercase">
                          {formatDateTimeToIST(patient.createdAt)}
                        </span>
                      </div>
                      <div className="w-3/4 text-center">
                        Address:{" "}
                        <span className="text-blue-500 font-semibold">
                          {patient.address}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-center gap-2 my-3">
                      {accessInfo?.accessEditPermission && (
                        <button
                          className="py-2 px-4 text-white bg-blue-900 rounded-lg font-semibold flex gap-1 items-center"
                          onClick={() => {
                            setEditPatient(patient);
                            setNewUserSection((prev) => !prev);
                          }}
                        >
                          Edit
                        </button>
                      )}
                      <button
                        className="p-2 text-white bg-slate-900 rounded-lg font-semibold flex gap-1 items-center"
                        onClick={() => {
                          handleShowPatientPrescription(patient._id);
                        }}
                        disabled={submitting}
                      >
                        {submitting ? <Loading size={15} /> : <></>}
                        {submitting ? "Showing..." : "Show Presriptions"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
        <div className="flex justify-end pr-4 ">
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
        </div>
        <Footer />
      </div>
    </>
  );
}

export default PatientSearchList;
