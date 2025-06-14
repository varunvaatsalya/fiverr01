"use client";

import * as XLSX from "xlsx";
import { useState } from "react";
import { FaCheckCircle, FaCloudUploadAlt } from "react-icons/fa";
import { BsFiletypeXlsx } from "react-icons/bs";
import Navbar from "../../../components/Navbar";

export default function Page() {
  const [jsonData, setJsonData] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const schemaType = [
    "Manufacturer",
    "Vendor",
    "Salts",
    "Medicine",
    "Stocks",
    "RetailStocks",
  ];
  const warnings = {
    Manufacturer: "Company Column should be in the sheet",
    Vendor: "Vendor Column should be in the sheet",
    Salts: "Salts Column should be in the sheet",
    Medicine:
      "Company, Vendor, Salts, Medicine, isTablets, medicineType, packetSize, rackPlace Column should be in the sheet",
    Stocks:
      "Medicine, batchName, mfgDate (MM-DD-YYYY), expiryDate (MM-DD-YYYY), purchasePrice, sellingPrice, stock should be in the sheet",
    RetailStocks:
      "Medicine, batchName, Unit, expiryDate (MM-DD-YYYY), purchasePrice(), sellingPrice, stock should be in the sheet",
  };

  // useEffect(()=>{

  // },[selectedType])

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      setName(file.name);
      // File reading completed
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result); // Read as binary
        const workbook = XLSX.read(data, {
          type: "array",
          cellText: true,
          cellDates: false,
        });

        // Convert first sheet data to JSON
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);

        console.log("Converted JSON Data: ", json);
        setJsonData(json);
      };

      reader.readAsArrayBuffer(file); // Read file as binary buffer
    }
  };

  const uniqueCompany = () => [
    ...new Set(
      jsonData
        .map((data) => (data.Company ? data.Company.toUpperCase() : null))
        .filter((company) => company !== null)
    ),
  ];
  // const uniqueVendor = () => [
  //   ...new Set(
  //     jsonData
  //       .map((data) => (data.Vendor ? data.Vendor.toUpperCase() : null))
  //       .filter((vendor) => vendor !== null)
  //   ),
  // ];
  function uniqueVendor() {
    const uniqueVendorsMap = new Map();

    jsonData
      .filter((vendor) => vendor.Vendor) // Skip entries missing the 'Vendor' field
      .forEach((vendor) => {
        uniqueVendorsMap.set(vendor.Vendor, vendor); // Store only unique Vendor names
      });

    return Array.from(uniqueVendorsMap.values()); // Convert Map to array
  }

  const uniqueSalts = () => [
    ...new Set(
      jsonData
        .map((data) => (data.Salt ? data.Salt.toUpperCase() : null))
        .filter((salt) => salt !== null)
    ),
  ];

  const MedicinesData = () =>
    jsonData
      .filter((data) => data.Company && data.Name && data.Salt)
      .map((data) => ({
        Company: data.Company.toUpperCase(),
        Name: data.Name.toUpperCase(),
        isTablets: data.isTablets,
        medicineType: data.medicineType
          ? data.medicineType.toUpperCase()
          : "N/A",
        Salt: data.Salt.toUpperCase(),
      }));

  const stockData = () =>
    jsonData.map((data) => ({
      Name: data.Name,
      PRate: data["P.Rate"],
      MRP: data["M.R.P."],
      Stock: data.Stock,
      Expiry: data.Expiry,
      Batch: data.Batch,
    }));

  const retailStocksData = () =>
    jsonData.map((data) => ({
      Name: data.Name,
      PRate: data["P.Rate"],
      MRP: data["M.R.P."],
      Unit: data.Unit,
      Tablets: data.Tablets,
      Expiry: data.Expiry,
      Batch: data.Batch,
    }));
  async function handleUpload() {
    console.log(MedicinesData());
    setSubmitting(true);

    let data;
    if (selectedType === "Manufacturer") data = uniqueCompany();
    else if (selectedType === "Vendor") data = uniqueVendor();
    else if (selectedType === "Salts") data = uniqueSalts();
    else if (selectedType === "Medicine") data = MedicinesData();
    else if (selectedType === "Stocks") data = stockData();
    else if (selectedType === "RetailStocks") data = retailStocksData();
    try {
      let result = await fetch(`/api/uploads?type=${selectedType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });
      result = await result.json();
      if (result.success) {
        setResult(result.result);
      }
      setMessage(result.message);
    } catch (error) {
      setMessage("Error in submitting application");
      console.error("Error submitting application:", error);
    }
    setSubmitting(false);
  }

  return (
    <>
      <Navbar route={["Pharmacy", "Uploads"]} />
      <div className="p-2 min-h-screen w-full bg-slate-800 text-white flex flex-col items-center">
        <h1 className="text-3xl font-bold">Upload Medicine Details</h1>
        {message && (
          <div className="text-center text-red-600 font-semibold">
            {message}
          </div>
        )}
        <label className="flex flex-col items-center w-1/2 md:w-1/4 mt-2 px-4 py-6 rounded-lg border border-gray-400">
          {name ? (
            <BsFiletypeXlsx className="size-12" />
          ) : (
            <FaCloudUploadAlt className="size-16" />
          )}
          {name ? (
            <div className="text-gray-200 text-lg font-semibold">{name}</div>
          ) : (
            <>
              <span className="mt-2 text-lg leading-normal ">
                Tap to Select a File
              </span>
              <span className="text-red-500 text-sm">XLSX / XLS format</span>
            </>
          )}
          <input
            type="file"
            className="hidden"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
        </label>
        <div className="mt-2 font-semibold">*Select Type</div>
        <div className="p-2 flex flex-wrap item-center gap-2 justify-center w-full md:w-3/4">
          {schemaType.map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
              }}
              className={
                "w-4/5 lg:w-2/5 py-2 px-3 text-lg font-semibold border rounded-lg text-center flex items-center justify-between " +
                (selectedType === type
                  ? "text-green-500 border-green-500"
                  : "text-gray-100 border-gray-400 hover:bg-gray-800")
              }
            >
              <div>{type}</div>
              {selectedType === type && <FaCheckCircle className="size-5" />}
            </button>
          ))}
        </div>
        {selectedType && (
          <>
            <div className="my-2 text-red-600 font-semibold">
              {"*" + warnings[selectedType]}
            </div>
            <button
              disabled={jsonData.length <= 0 || submitting}
              onClick={handleUpload}
              className="rounded-lg font-semibold px-3 py-2 bg-green-500 disabled:bg-gray-600"
            >
              {submitting ? "Uploading..." : "Upload"}
            </button>
          </>
        )}
        {result.length > 0 && (
          <>
            <button
              disabled={result.length <= 0}
              onClick={() => setMessage([])}
              className="rounded-lg my-2 font-semibold px-3 py-2 bg-red-500 disabled:bg-gray-600"
            >
              Clear
            </button>
            <h1 className="text-xl font-bold">Logs</h1>
            <ol>
              {result.map((mess, index) => (
                <li key={index} className={mess?.success ? "" : "text-red-600"}>
                  {index + 1 + ". " + mess.info}
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </>
  );
}
