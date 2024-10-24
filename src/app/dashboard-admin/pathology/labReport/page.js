"use client";
import React, { useEffect, useState } from "react";


const testFormat = {
  items: [
    { name: "hemoglobine", range: "200 - 300", unit: "kg/ml" },
    { name: "wbc", range: "50 - 100", unit: "mg/ml" },
    { name: "iron", range: "150 - 300", unit: "g/ml" },
  ],
};

function Page() {
  const [tests, setTests] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [allTests, setAllTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [testFormat, setTestFormat] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(null);

  const [results, setResults] = useState();

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/pathologyLabRes");
        result = await result.json();
        if (result.success) {
          setTests(result.pendingTests);
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
    console.log(alltest);
  }, [selectedPatient]);

  useEffect(() => {
    console.log(selectedTest?.test);
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
    fetchData();
  }, [selectedTest]);

  const handleResultChange = (index, value) => {
    const newResults = [...results];
    newResults[index] = value; // Update the result for the specific test
    setResults(newResults);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

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
        }),
      });

      // Parsing the response as JSON
      result = await result.json();
      // Check if login was successful
      if (result.success) {
        setSelectedPatient("");
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
    <div className="bg-slate-950 min-h-screen w-full py-3">
      <div className="w-[95%] md:w-4/5 lg:w-3/4 mx-auto rounded-xl bg-slate-800">
        <h1 className="font-bold text-2xl text-center py-3 border-b-2 border-gray-950 text-white">
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
              <option value="">Select Test</option>
              {allTests.map((testItem, index) => {
                console.log(testItem);
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
            <thead>
              <tr className="bg-gray-700 px-2 py-1">
                <th>Test Name</th>
                <th>Result</th>
                <th>Normal Range</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {testFormat ? (
                testFormat?.items?.map((test, index) => (
                  <tr key={index} className="py-1">
                    <td>{test.name}</td>
                    <td>
                      <input
                        type="text"
                        value={results[index]}
                        onChange={(e) =>
                          handleResultChange(index, e.target.value)
                        }
                        placeholder="Enter result"
                        className="bg-gray-400 text-black px-2"
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
            <button
              type="submit"
              className="px-3 py-2 mx-auto my-3 flex items-center justify-center gap-2 bg-red-500 rounded-lg font-semibold cursor-pointer text-white"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Results"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default Page;
