"use client";

import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaCloudUploadAlt } from "react-icons/fa";
import { BsFiletypeXlsx } from "react-icons/bs";
import Navbar from "../../../components/Navbar";

export default function Page() {
  const [jsonData, setJsonData] = useState([]);
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const schemaType = ["Manufacturer", "Vendor", "Salts", "Medicine", "Stocks"];
  const warnings = {
    Manufacturer: "Company Column should be in the sheet",
    Vendor: "Vendor Column should be in the sheet",
    Salts: "Salts Column should be in the sheet",
    Medicine:
      "Company, Vendor, Salts, Medicine, isTablets, medicineType, packetSize, rackPlace Column should be in the sheet",
    Stocks:
      "Medicine, batchName, mfgDate, expiryDate, purchasePrice, sellingPrice, stock should be in the sheet",
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
        const workbook = XLSX.read(data, { type: "array" });

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

  const uniqueCompanies = [
    ...new Set(jsonData?.map((medicine) => medicine.Company.toUpperCase())),
  ];
  console.log(uniqueCompanies);

  return (
    <>
      <Navbar route={["Pharmacy", "Uploads"]} />
      <div className="p-2 min-h-screen w-full bg-slate-800 text-white flex flex-col items-center">
        <h1 className="text-3xl font-bold">Upload Medicine Details</h1>
        <label class="flex flex-col items-center w-1/2 md:w-1/4 mt-2 px-4 py-6 rounded-lg border border-gray-400">
          {name ? (
            <BsFiletypeXlsx className="size-12" />
          ) : (
            <FaCloudUploadAlt className="size-16" />
          )}
          {name ? (
            <div className="text-gray-200 text-lg font-semibold">{name}</div>
          ) : (
            <>
              <span class="mt-2 text-lg leading-normal ">
                Tap to Select a File
              </span>
              <span class="text-red-500 text-sm">XLSX / XLS format</span>
            </>
          )}
          <input
            type="file"
            class="hidden"
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
          <div className="my-2 text-red-600 font-semibold">
            {"*" + warnings[selectedType]}
          </div>
        )}
      </div>
    </>
  );
}
