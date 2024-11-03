"use client";
import React, { useEffect, useState } from "react";
import { formatDateTimeToIST } from "../utils/date";
import Loading from "./Loading";

function Report({ printReport, setPrintReport }) {
  const [prescriptions, setPrescriptions] = useState(null);

  function parseRange(rangeStr, gender = null) {
    // Remove spaces, commas, parentheses, and "millions" from the range string
    let cleanedRange = rangeStr
      .replace(/[\s,()]/g, "")
      .replace("*millions", "");

    // Detect and handle gender-specific ranges if present
    const hasMaleRange = /Male/i.test(rangeStr);
    const hasFemaleRange = /Female/i.test(rangeStr);

    if (hasMaleRange || hasFemaleRange) {
      const maleMatch = rangeStr.match(/Male.*?(\d+(\.\d+)?)-(\d+(\.\d+)?)/i);
      const femaleMatch = rangeStr.match(
        /Female.*?(\d+(\.\d+)?)-(\d+(\.\d+)?)/i
      );

      // Use the appropriate gender range if gender is specified
      if (gender === "m" && maleMatch) {
        return [parseFloat(maleMatch[1]), parseFloat(maleMatch[3])];
      } else if (gender === "f" && femaleMatch) {
        return [parseFloat(femaleMatch[1]), parseFloat(femaleMatch[3])];
      } else {
        return null; // Gender not specified correctly or doesn't match range
      }
    }

    // Match basic or decimal range pattern, e.g., '200-300', '4.5-6.5'
    const match = cleanedRange.match(/^(\d+(\.\d+)?)-(\d+(\.\d+)?)$/);
    if (!match) return null;

    // Parse the lower and upper bounds
    const lower = parseFloat(match[1]);
    const upper = parseFloat(match[3]);

    return [lower, upper];
  }

  function normalizeValue(valueStr) {
    // Remove commas from the value
    let cleanedValue = valueStr.replace(/,/g, "");

    // Convert to float or integer as appropriate
    return parseFloat(cleanedValue);
  }

  function isInRange(rangeStr, value, gender = "m") {
    // Parse the range limits
    if (!rangeStr || !value) return true;
    const range = parseRange(rangeStr, gender);
    if (!range) return false;

    const [lower, upper] = range;
    const normalizedValue = normalizeValue(String(value));
    return normalizedValue >= lower && normalizedValue <= upper;
  }

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
        <Loading size={50} />
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
      {prescriptions.tests.map((test, index) => {
        return (
          <div
            key={index}
            class="max-w-4xl mx-auto bg-white text-black p-8 pt-40 rounded-lg shadow-lg break-after-page"
          >
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
                  {formatDateTimeToIST(test.resultDate)}
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
                      <td class="border px-4 text-sm">{item.name}</td>
                      <td
                        class={
                          " border px-4 text-sm " +
                          (isInRange(
                            item.range,
                            result?.result,
                            prescriptions.patient?.gender[0]
                          )
                            ? ""
                            : "font-bold underline")
                        }
                      >
                        {result ? result.result : "N/A"}
                      </td>
                      <td class="border px-4 text-sm">{item.range}</td>
                      <td class="border px-4 text-sm">
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
