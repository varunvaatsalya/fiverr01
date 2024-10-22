"use client"
import React, { useEffect, useState } from "react";
import { formatDateTimeToIST } from "../utils/date";
import Loading from "./Loading";

function Report({ printReport, setPrintReport }) {
  const [prescriptions, setPrescriptions] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch(`/api/labReportPrint?id=${printReport}`);
        result = await result.json();
        if (result.success) {
          setPrescriptions(result.prescriptionDetails);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  if (!prescriptions)
    return (
      <div className="min-h-screen w-full flex justify-center gap-2 items-center bg-black">
        <Loading size={50}/>
        <div className="text-2xl">Loading...</div>
      </div>
    );
  return (
    <div>
      <div className="flex justify-center space-x-2 print-btn">
        <button
          onClick={() => {
            window.print();
          }}
          className="bg-blue-600 hover:bg-blue-500 rounded px-6 py-2 my-2 font-semibold text-lg text-white"
        >
          Print
        </button>
        <button
          onClick={() => {
            setPrintReport(null);
          }}
          className="bg-red-600 hover:bg-red-500 rounded px-4 py-2 my-2 font-semibold text-lg text-white"
        >
          Cancel
        </button>
      </div>
      {prescriptions.tests.map((test) => {
        return (
          <div class="max-w-4xl mx-auto bg-white text-black p-8 rounded-lg shadow-lg">
            <h1 class="text-2xl font-bold mb-8 text-center">
              Pathology Report
            </h1>
            <div className="flex justify-between mb-6">
              <div class="">
                <p class="text-base">
                  <span class="font-semibold">Patient: </span>
                  {prescriptions.patient.name}
                </p>
                <p class="text-base">
                  <span class="font-semibold">UHID: </span>
                  {prescriptions.patient.uhid}
                </p>
                <p class="text-base capitalize">
                  <span class="font-semibold">Gender/Age: </span>
                  {prescriptions.patient?.gender[0] +
                    "/" +
                    prescriptions.patient.age}
                </p>
                <p class="text-base">
                  <span class="font-semibold">Mo. No.: </span>
                  {prescriptions.patient.mobileNumber}
                </p>
                <p class="text-base">
                  <span class="font-semibold">Address: </span>
                  {prescriptions.patient?.address}
                </p>
              </div>

              <div class="">
                <p class="text-base">
                  <span class="font-semibold">Lab Test#: </span>
                  {test.test.ltid}
                </p>
                <p class="text-base">
                  <span class="font-semibold">Test Name: </span>
                  {test.test.name}
                </p>
                <p class="text-base">
                  <span class="font-semibold">Analysis Date: </span>
                  {test.resultDate}
                </p>
                <p class="text-base">
                  <span class="font-semibold">Pathologist: </span>
                  {"Dr. " + prescriptions.doctor.name}
                </p>
                <p class="text-base">
                  <span class="font-semibold">Date Requested: </span>
                  {formatDateTimeToIST(prescriptions.createdAt)}
                </p>
              </div>
            </div>
            <table class="table-auto w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-200">
                  <th class="border px-4 py-1">Tests</th>
                  <th class="border px-4 py-1">Result</th>
                  <th class="border px-4 py-1">Normal Range</th>
                  <th class="border px-4 py-1">Units</th>
                </tr>
              </thead>
              <tbody>
                {test.test.items.map((item, index) => {
                  const result = test.results.find((r) => r.name === item.name);
                  return (
                    <tr key={index}>
                      <td class="border px-4 py-2 text-sm">{item.name}</td>
                      <td class="border px-4 py-2 text-sm">
                        {result ? result.result : "N/A"}
                      </td>
                      <td class="border px-4 py-2 text-sm">{item.range}</td>
                      <td class="border px-4 py-2 text-sm">
                        {result ? result.unit : item.unit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export default Report;
