"use client";
import React, { useEffect, useState } from "react";

function EditReportForm({ setNewUserSection, editReport }) {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState(null);
  const [results, setResults] = useState();
  const [submitting, setSubmitting] = useState(false);
  const [createdAt, setCreatedAt] = useState("");
  const [isAddInfoOpen, setIsAddInfoOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch(
          `/api/updatePathoLabRes?pId=${editReport._id}&testObjId=${editReport.testObjId}&testId=${editReport.testId}`
        );
        result = await result.json();
        if (result.success) {
          setData(result.response);
          setResults(
            result.response.testDetails[0]?.testItems.map((test) => {
              const matchedResult = result.response.testDetails[0].results.find(
                (resultItem) => resultItem.name === test.name
              );
              return matchedResult ? matchedResult.result : "";
            })
          );
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);

  const handleResultChange = (index, value) => {
    const newResults = [...results];
    newResults[index] = value;
    setResults(newResults);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (createdAt) {
      let confirm = window.confirm("Are you sure you want to change the date?");
      if (!confirm) {
        return;
      }
    }
    const testResults = data?.testDetails[0]?.testItems.map((test, index) => ({
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
          selectedTest: editReport.testId,
          selectedPrescription: editReport._id,
          resultDate: createdAt,
        }),
      });

      // Parsing the response as JSON
      result = await result.json();
      setMessage(result.message);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="py-3">
      <div className="w-full p-2 flex flex-wrap justify-around">
        <div className="">
          Patient Name:{" "}
          <span className="text-blue-500">{data?.patientName}</span>
        </div>
        <div className="">
          UHID: <span className="text-blue-500">{data?.patientUHID}</span>
        </div>
      </div>
      <table className="table-auto w-full md:w-3/4 mx-auto text-left border-collapse px-3">
        <thead>
          <tr className="bg-gray-700 text-gray-200 px-2 py-1">
            <th>Test Name</th>
            <th>Result</th>
            <th>Normal Range</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {data ? (
            data?.testDetails[0]?.testItems?.map((test, index) => {
              return (
                <tr key={index} className="py-1 text-gray-100">
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
              );
            })
          ) : (
            <></>
          )}
        </tbody>
      </table>
      <div className="text-blue-800 text-start px-4">
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
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}
      <hr className="border border-slate-800 w-full my-2" />
      <div className="flex px-4 gap-3 justify-end">
        <div
          className="py-1 px-3 my-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
          onClick={() => {
            setNewUserSection((prev) => !prev);
          }}
        >
          Cancel
        </div>
        <button
          type="submit"
          className="px-3 py-1 my-1 flex items-center justify-center gap-2 bg-red-500 rounded-lg font-semibold cursor-pointer text-white"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Results"}
        </button>
      </div>
    </form>
  );
}

export default EditReportForm;
