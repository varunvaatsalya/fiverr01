import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { PiSealWarningBold } from "react-icons/pi";
import { IoIosArrowDropdown, IoIosArrowDropright } from "react-icons/io";
import Loading from "./Loading";
import { IoSearchOutline } from "react-icons/io5";

function NewIpdPatient({ patientsList, bed, setBed }) {
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [finding, setFinding] = useState(false);
  const [patientBedDetails, setPatientBedDetails] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newUserSection, setNewUserSection] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [query, setQuery] = useState("");
  const [reason, setReason] = useState("");
  const [searchedPatientsList, setSearchedPatientsList] = useState([]);
  const [selectedPatientList, setSelectedPatientList] = useState({
    type: "Latest",
    data: patientsList,
  });

  const { handleSubmit, setValue } = useForm();

  const onPatientSubmit = async () => {
    try {
      setMessage(null);
      setSubmitting(true);
      let result = await fetch(`/api/admission?patient=${selectedPatient}`);
      result = await result.json();

      if (result.success) {
        setPatientBedDetails(result.bedWithPatient);
        setNewUserSection((prev) => !prev);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };
  const onConifrmSubmit = async () => {
    try {
      setMessage(null);
      setSubmitting(true);
      let result = await fetch(`/api/admission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify({
          patientId: selectedPatient,
          newBedId: bed._id,
          reason,
        }), // Properly stringify the data
      });
      result = await result.json();

      if (result.success) {
        setBed(result.updatedBed);
        setNewUserSection((prev) => !prev);
      }
      setMessage(result.message);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchPatient = async () => {
    if (query) {
      try {
        setMessage(null);
        setFinding(true);
        let result = await fetch(`/api/searchPatient`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
          }),
        });
        result = await result.json();

        if (result.success) {
          setSearchedPatientsList(result.patients);
          setSelectedPatientList({ type: "Searched", data: result.patients });
        }
        setMessage(result.message);
      } catch (error) {
        console.error("Error submitting application:", error);
      } finally {
        setFinding(false);
      }
    }
  };
  return (
    <>
      {newUserSection && (
        <div className="absolute top-0 left-0">
          <div className="fixed w-screen h-screen text-gray-100 bg-gray-700/[.5] z-30 flex justify-center items-center">
            <form
              onSubmit={handleSubmit(onConifrmSubmit)}
              className="w-[95%] md:w-3/4 lg:w-1/2 py-4 text-center bg-slate-950 px-4 rounded-xl"
            >
              <PiSealWarningBold className="size-16 mx-auto text-red-500 " />
              <div className="font-semibold text-2xl">Confirm</div>
              {(() => {
                let patient = patientsList.find(
                  (patient) => patient._id === selectedPatient
                );
                if (!patient) {
                  patient = searchedPatientsList.find(
                    (searchedPatient) => searchedPatient._id === selectedPatient
                  );
                }
                return (
                  <div className="my-2">
                    <div className="text-center">The Patient</div>
                    <div className="text-center text-lg text-blue-500">
                      {patient.name}
                      <span className="text-base text-white"> UHID: </span>
                      {patient.uhid}
                    </div>
                  </div>
                );
              })()}
              {patientBedDetails ? (
                <div className="text-lg">
                  is already on Ward:{" "}
                  <span className="text-blue-500">
                    {patientBedDetails.ward.name}
                  </span>{" "}
                  Bed:{" "}
                  <span className="text-blue-500">
                    {patientBedDetails.bedName}
                  </span>{" "}
                </div>
              ) : (
                <>
                  <div className="text-lg font-medium">
                    is not on any bed right now!
                  </div>
                </>
              )}
              <div className="my-2 text-lg text-red-300">
                Do you want to allocate him to{" "}
                <span className="font-bold">{bed.ward.name}</span> ward, bed{" "}
                <span className="font-bold">{bed.bedName}</span>
              </div>
              {!patientBedDetails && (
                <textarea
                  name="reason"
                  onChange={(e) => {
                    setReason(e.target.value);
                  }}
                  placeholder="Reason for admission"
                  className="w-3/4 mx-auto bg-gray-800 p-2 rounded-lg"
                >
                  {reason}
                </textarea>
              )}
              {message && (
                <div className="my-1 text-center text-red-500">{message}</div>
              )}
              <hr className="border border-slate-800 w-full my-2" />
              <div className="flex px-4 gap-3 justify-end">
                <div
                  className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
                  onClick={() => {
                    setNewUserSection((prev) => !prev);
                  }}
                >
                  Cancel
                </div>
                <button
                  type="submit"
                  className="w-20 h-8 py-1 flex items-center justify-center gap-2 bg-red-500 rounded-lg font-semibold cursor-pointer text-white"
                  disabled={submitting}
                >
                  {submitting ? <Loading size={15} /> : <></>}
                  {submitting ? "Wait..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="bg-gray-900 text-white rounded-xl p-4 w-full md:w-3/4 mx-auto my-2">
        <div className="text-xl font-semibold text-center">
          Select Patient for new{" "}
          <span className="text-blue-500">IPD Admission</span>
        </div>
        <div className="w-[90%] md:w-4/5 lg:w-3/4 mx-auto px-2">
          {message && (
            <div className="my-1 text-center text-red-500">{message}</div>
          )}

          {selectedPatient && (
            <div className="flex flex-wrap justify-around my-2">
              <div className="font-semibold">
                Pateint:{" "}
                <span className="text-blue-500 uppercase">
                  {
                    selectedPatientList.data.find(
                      (patient) => patient._id === selectedPatient
                    )?.name
                  }
                </span>
              </div>
              <div className="font-semibold">
                UHID:{" "}
                <span className="text-blue-500 uppercase">
                  {
                    selectedPatientList.data.find(
                      (patient) => patient._id === selectedPatient
                    )?.uhid
                  }
                </span>
              </div>
            </div>
          )}
          <div className="relative">
            <div className="flex justify-center gap-2 items-center mt-1 mb-4">
              <div
                onClick={() => {
                  setDropDown(!dropDown);
                }}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer text-gray-100 text-2xl"
              >
                {dropDown ? <IoIosArrowDropdown /> : <IoIosArrowDropright />}
              </div>
              <input
                type="text"
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                placeholder="Select or Search the Patient"
                className=" block px-4 py-3 w-full text-gray-100 bg-gray-700  rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
              />
              <button
                disabled={finding || !query}
                onClick={handleSearchPatient}
                className="p-2 rounded-lg hover:bg-gray-600 bg-gray-700 text-gray-100 text-2xl"
              >
                {finding ? <Loading size={20} /> : <IoSearchOutline />}
              </button>
            </div>
            {dropDown && (
              <div className="absolute top-12 left-12 my-1 rounded-lg max-h-52 overflow-y-auto p-2 bg-gray-600 border-2 border-gray-500 scrollbar-hide">
                <div className="p-2 flex items-center gap-2">
                  <div
                    onClick={() => {
                      setSelectedPatientList({
                        type: "Latest",
                        data: patientsList,
                      });
                    }}
                    className={
                      "py-1 px-2 cursor-pointer rounded border border-gray-200 font-semibold " +
                      (selectedPatientList.type === "Latest"
                        ? "bg-gray-200 text-gray-800"
                        : "text-gray-50")
                    }
                  >
                    Latest
                  </div>
                  <div
                    onClick={() => {
                      setSelectedPatientList({
                        type: "Searched",
                        data: searchedPatientsList,
                      });
                    }}
                    className={
                      "py-1 px-2 cursor-pointer rounded border border-gray-200 font-semibold " +
                      (selectedPatientList.type === "Searched"
                        ? "bg-gray-200 text-gray-800"
                        : "text-gray-50")
                    }
                  >
                    Searched
                  </div>
                </div>
                {selectedPatientList.data.map((patient, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedPatient(patient._id);
                      setValue("patient", patient._id);
                      setDropDown(!dropDown);
                    }}
                    className="p-1 rounded cursor-pointer hover:bg-gray-500 px-6"
                  >
                    {patient.name + ", UHID: " + patient.uhid}
                  </div>
                ))}
              </div>
            )}
          </div>
          <hr className="border border-slate-600 w-full my-2" />
          <div className="flex px-4 gap-3 justify-end">
            <button
              onClick={onPatientSubmit}
              className="w-20 h-8 py-1 flex items-center justify-center gap-2 bg-green-500 rounded-lg font-semibold cursor-pointer text-white"
              disabled={submitting || !selectedPatient}
            >
              {submitting ? <Loading size={15} /> : <></>}
              {submitting ? "Wait..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default NewIpdPatient;
