import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { PiSealWarningBold } from "react-icons/pi";
import Loading from "./Loading";

function NewIpdPatient({ patientsList, bed, setBed }) {
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [patientBedDetails, setPatientBedDetails] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newUserSection, setNewUserSection] = useState(false);
  const [reason, setReason] = useState("");

  const { register, handleSubmit } = useForm();

  const onPatientSubmit = async (data) => {
    try {
      setMessage(null);
      setSubmitting(true);
      let result = await fetch(`/api/admission?patient=${data.patient}`);
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
        body: JSON.stringify({ patientId: selectedPatient, newBedId: bed._id, reason }), // Properly stringify the data
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
              {!patientBedDetails && <textarea
                    name="reason"
                    onChange={(e) => {
                      setReason(e.target.value);
                    }}
                    placeholder="Reason for admission"
                    className="w-3/4 mx-auto bg-gray-800 p-2 rounded-lg"
                  >
                    {reason}
                  </textarea>}
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
        <form
          onSubmit={handleSubmit(onPatientSubmit)}
          className="w-[90%] md:w-4/5 lg:w-3/4 max-h-[80vh] overflow-auto mx-auto px-2"
        >
          {message && (
            <div className="my-1 text-center text-red-500">{message}</div>
          )}
          <select
            id="patient"
            {...register("patient", { required: "patient is required" })}
            onChange={(e) => {
              setSelectedPatient(e.target.value);
            }}
            className="mt-1 mb-4 block px-4 py-3 w-full text-gray-100 bg-gray-700  rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
          >
            <option value="">-- Select Patient --</option>
            {patientsList.map((patient, index) => (
              <option key={index} value={patient._id}>
                {patient.name + ", UHID: " + patient.uhid}
              </option>
            ))}
          </select>
          <hr className="border border-slate-600 w-full my-2" />
          <div className="flex px-4 gap-3 justify-end">
            <button
              type="submit"
              className="w-20 h-8 py-1 flex items-center justify-center gap-2 bg-green-500 rounded-lg font-semibold cursor-pointer text-white"
              disabled={submitting}
            >
              {submitting ? <Loading size={15} /> : <></>}
              {submitting ? "Wait..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default NewIpdPatient;
