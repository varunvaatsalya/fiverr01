import React from "react";
import { formatDateToIST } from "../utils/date";

const items = [
  {
    name: "ECG",
    price: 125,
  },
  {
    name: "X-RAY",
    price: 254,
  },
  {
    name: "RBC test",
    price: 452,
  },
  {
    name: "ultrasound",
    price: 125,
  },
  {
    name: "Medicenes",
    price: 125,
  },
];

function Invoice({ printPrescription, setPrintPrescription }) {
  console.log(printPrescription);
  return (
    <>
      <div
        id="invoice"
        className="bg-gray-100 text-black flex flex-col justify-center items-center"
      >
        <div
          id="invoice"
          className="max-w-4xl w-full bg-white shadow-md p-6 flex flex-col justify-between"
        >
          <div className="print-btn">
            <div className="flex justify-center space-x-2">
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
                  setPrintPrescription(null);
                }}
                className="bg-red-600 hover:bg-red-500 rounded px-4 py-2 my-2 font-semibold text-lg text-white"
              >
                Cancel
              </button>
            </div>
            <div className="text-red-500 text-center">
              * Prescription will not be editable after clicking the print
              button.
            </div>
          </div>
          <div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold uppercase">City Hospital</h1>
              <p className="text-xs">
                123 Main Street, City, Country | Phone: +91-9876543210
              </p>
              <p className="text-xs">
                Email: info@cityhospital.com | Website: www.cityhospital.com
              </p>
            </div>
            <hr className="my-4" />

            <div className="flex justify-between mb-6 text-sm">
              <div>
                <h2 className="text-lg font-semibold mb-2">Patient Details</h2>
                <p>
                  <strong>Name: </strong>
                  <span className="uppercase">
                    {printPrescription.patient.name}
                  </span>
                </p>
                <p>
                  <strong>Gender/Age:</strong>{" "}
                  <span className="uppercase">
                    {(printPrescription.patient.gender
                      ? printPrescription.patient.gender[0]
                      : "-") +
                      "/" +
                      printPrescription.patient.age}
                  </span>
                </p>
                <p>
                  <strong>Mobile:</strong>{" "}
                  {printPrescription.patient.mobileNumber}
                </p>
                <p>
                  <strong>UHID:</strong> {printPrescription.patient.uhid}
                </p>
                <p>
                  <strong>Address:</strong> {printPrescription.patient.address}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Invoice Info</h2>
                <p>
                  <strong>Invoice ID:</strong> {printPrescription.pid}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {formatDateToIST(printPrescription.createdAt)}
                </p>
                <p>
                  <strong>Mode of Payment:</strong>{" "}
                  {printPrescription.paymentMode}
                </p>
              </div>
            </div>
            <hr className="my-4" />

            <div className="my-6">
              <h2 className="text-lg font-semibold mb-2">
                Prescription Details
              </h2>
              <p className="text-base">
                <strong>Department:</strong> {printPrescription.department.name}
              </p>
              <table className="min-w-full bg-white text-sm">
                <thead>
                  <tr>
                    <th className="py-2 px-2 border w-16">Sr No.</th>
                    <th className="py-2 px-4 border text-start">Item Name</th>
                    <th className="py-2 px-4 border">Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {printPrescription.items.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td className="py-1 px-2 border w-16">{index + 1}.</td>
                        <td className="py-1 px-4 border">{item.name}</td>
                        <td className="py-1 px-4 border text-center">
                          {item.price}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end">
                <p className="font-semibold text-lg">
                  Grand Total: ₹{" "}
                  {printPrescription.items.reduce(
                    (sum, item) => sum + item.price,
                    0
                  )}
                </p>
              </div>
            </div>
            <hr className="my-4" />

            <div className="mb-6 capitalize">
              <h2 className="text-lg font-bold mb-2 ">Doctor Details</h2>
              <p className="text-sm">
                <strong>Doctor Name:</strong> Dr.{" "}
                {printPrescription.doctor.name}
              </p>
              <p className="text-sm">
                <strong>Speciality:</strong>{" "}
                {printPrescription.doctor.specialty}
              </p>
            </div>
          </div>

          <hr className="my-4" />

          <div className="text-center text-xs">
            <p>Thank you for choosing City Hospital</p>
            <p className="mt-1">This is a computer-generated invoice.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Invoice;
