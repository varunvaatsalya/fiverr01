"use client";
import React, { useEffect, useState } from "react";

function UploadPathLabReport() {
  const [tests, setTests] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [allTests, setAllTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [testFormat, setTestFormat] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [createdAt, setCreatedAt] = useState("");
  const [isAddInfoOpen, setIsAddInfoOpen] = useState(false);

  const [results, setResults] = useState();
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/pathologyLabRes");
        result = await result.json();
        if (result.success) {
          setTests(result.pendingTests);
          // console.log(result.pendingTests)
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    // Filter prescriptions for the selected patient
    const patientInvoices = tests.filter(
      (invoice) => invoice.patient._id === selectedPatient
    );

    // Flatten the tests and retain both the test and the prescription ID
    const alltest = patientInvoices.flatMap((invoice) =>
      invoice.tests.map((test) => ({
        ...test,
        prescriptionId: invoice._id, // Add prescription ID to each test
      }))
    );

    // Set the flattened tests with prescription IDs
    setAllTests(alltest);
    // console.log(alltest);
  }, [selectedPatient]);

  useEffect(() => {
    // console.log(selectedTest?.test);
    async function fetchData() {
      try {
        let result = await fetch(`/api/pathologyLabTest?id=${selectedTest}`);
        result = await result.json();
        if (result.success) {
          setTestFormat(result.pathologyLabTest);
          setResults(result.pathologyLabTest.items.map(() => ""));
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }

    if (selectedTest) fetchData();
    else setTestFormat(null);
  }, [selectedTest]);

  const handleResultChange = (index, value) => {
    const newResults = [...results];
    newResults[index] = value; // Update the result for the specific test
    setResults(newResults);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (createdAt) {
      let confirm = window.confirm("Are you sure you want to change the date?");
      if (!confirm) {
        return;
      }
    }
    // Collecting data to submit
    const testResults = testFormat.items.map((test, index) => ({
      name: test.name,
      result: results[index],
      unit: test.unit,
    }));

    setSubmitting(true);
    try {
      let result = await fetch("/api/pathologyLabRes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify({
          testResults,
          selectedTest,
          selectedPrescription,
          resultDate: createdAt,
        }),
      });

      // Parsing the response as JSON
      result = await result.json();
      // Check if login was successful
      if (result.success) {
        setTests((prescriptions) =>
          prescriptions.map((pres) =>
            pres._id === selectedPrescription
              ? {
                  ...pres,
                  tests: pres.tests.filter(
                    (test) => test.test._id !== selectedTest
                  ),
                }
              : pres
          )
        );
        setAllTests((allTests) =>
          allTests.filter(
            (test) =>
              !(
                test.test._id === selectedTest &&
                test.prescriptionId === selectedPrescription
              )
          )
        );
        setTestFormat(null);
        setSelectedTest("");
        setSelectedPrescription("");
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="w-[95%] md:w-4/5 lg:w-3/4 mx-auto rounded-xl bg-slate-800 my-2">
      <h1 className="font-bold text-2xl text-center py-3 border-b-2 border-gray-400 text-white">
        Upload Lab Results
      </h1>
      {message && (
        <div className="text-red-500 text-center font-bold">{message}</div>
      )}
      <div className="flex flex-wrap justify-around p-2">
        <select
          name="patient"
          className="mt-1 block text-white px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
          onChange={(e) => setSelectedPatient(e.target.value)}
        >
          <option value="">Select Patient</option>
          {tests.map((test, index) => {
            return (
              <option value={test.patient._id} key={index}>
                {test.patient.name + ", " + test.patient.uhid}
              </option>
            );
          })}
        </select>
        {allTests.length > 0 && (
          <select
            name="test"
            className="mt-1 block text-white px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
            value={
              selectedTest && selectedPrescription
                ? `${selectedTest},${selectedPrescription}`
                : ""
            }
            onChange={(e) => {
              const selectedValue = e.target.value;
              if (selectedValue) {
                const [testId, prescriptionId] = selectedValue.split(",");
                setSelectedTest(testId);
                setSelectedPrescription(prescriptionId);
              } else {
                setSelectedTest(null);
                setSelectedPrescription(null);
              }
            }}
          >
            <option value={""}>Select Test</option>
            {allTests.map((testItem, index) => {
              return (
                <option
                  value={`${testItem.test._id},${testItem.prescriptionId}`}
                  key={index}
                  className="capitalize"
                >
                  {testItem.test.name + ", " + testItem.test.price}
                </option>
              );
            })}
          </select>
        )}
      </div>
      <form onSubmit={handleSubmit} className="py-3">
        <table className="table-auto w-full md:w-3/4 mx-auto text-left border-collapse px-3">
          <thead className="bg-gray-700 text-gray-100">
            <tr>
              <th className="px-2 rounded-l-lg font-semibold">Test Name</th>
              <th className="font-semibold">Result</th>
              <th className="font-semibold">Normal Range</th>
              <th className="rounded-r-lg font-semibold">Unit</th>
            </tr>
          </thead>
          <tbody>
            {testFormat ? (
              testFormat?.items?.map((test, index) => (
                <tr key={index} className="py-1 text-gray-100">
                  <td className="px-2">{test.name}</td>
                  <td>
                    <input
                      type="text"
                      value={results[index]}
                      onChange={(e) =>
                        handleResultChange(index, e.target.value)
                      }
                      placeholder="Enter result"
                      className="bg-gray-600 text-gray-100 font-medium px-2 rounded outline-none"
                    />
                  </td>
                  <td>{test.range}</td>
                  <td>{test.unit}</td>
                </tr>
              ))
            ) : (
              <></>
            )}
          </tbody>
        </table>
        {selectedTest && (
          <>
            <div className="text-blue-500 text-start px-4">
              <span
                className="hover:underline underline-offset-2 text-sm cursor-pointer"
                onClick={() => {
                  setIsAddInfoOpen(!isAddInfoOpen);
                }}
              >
                additional Info
              </span>
            </div>
            {isAddInfoOpen && (
              <div className="w-full px-4">
                <label for="createdAt" className="text-gray-200">
                  Created date
                </label>
                <input
                  type="datetime-local"
                  name="createdAt"
                  id="createdAt"
                  onChange={(e) => {
                    setCreatedAt(e.target.value);
                  }}
                  className="px-3 py-1 mx-2 bg-gray-700 text-gray-300 outline-none rounded-lg shadow-sm"
                />
              </div>
            )}
            <div className="px-4 flex justify-end items-center gap-4">
              <button
                type="submit"
                className="px-3 py-2 my-3 flex items-center justify-center gap-2 bg-red-500 rounded-lg font-semibold cursor-pointer text-white"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Results"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default UploadPathLabReport;
