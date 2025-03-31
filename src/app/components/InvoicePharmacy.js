import React, { useState } from "react";
import { formatDateTimeToIST, formatDateToIST } from "../utils/date";
import { PharmacyDetails } from "../HospitalDeatils";

function InvoicePharmacy({
  printInvoice,
  setPrintInvoice,
  prescriptionPrinted,
}) {
  const [isToken, setIstoken] = useState(false);

  return (
    <>
      <div
        id="invoice"
        className={
          (isToken ? "token-printing" : "invoice-printing") +
          " bg-white text-black flex flex-col items-center"
        }
      >
        <div
          id="invoice"
          className={
            isToken
              ? "max-w-4xl"
              : "max-w-4xl" +
                " w-full min-h-[90vh] bg-white shadow-md p-6 flex flex-col justify-between"
          }
        >
          <div className="print-btn">
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => {
                  setIstoken(true);
                  const printStyle = document.createElement("style");
                  printStyle.media = "print";
                  printStyle.innerHTML = "@page { size: 8cm 30cm; }";
                  document.head.appendChild(printStyle);
                  setTimeout(() => {
                    window.print();
                    setIstoken(false);
                    document.head.removeChild(printStyle);
                  }, 100);
                }}
                className="text-blue-600 border border-blue-600 hover:bg-blue-100 rounded px-6 py-2 my-2 font-semibold text-lg"
              >
                Token
              </button>
              <button
                onClick={() => {
                  // prescriptionPrinted(printInvoice._id);
                  window.print();
                }}
                className="bg-blue-600 hover:bg-blue-500 rounded px-6 py-2 my-2 font-semibold text-lg text-white"
              >
                Print
              </button>
              <button
                onClick={() => {
                  setPrintInvoice(null);
                }}
                className="bg-red-600 hover:bg-red-500 rounded px-4 py-2 my-2 font-semibold text-lg text-white"
              >
                Cancel
              </button>
            </div>
            <div className="text-red-500 text-center">
              * Invoice will not be editable after clicking the print button.
            </div>
          </div>
          <div>
            <div className={"mb-6 " + (isToken ? "text-start" : "text-center")}>
              <h1 className="text-xl font-bold uppercase">
                {PharmacyDetails?.name}
              </h1>
              <p className={"text-xs " + (isToken ? "" : "")}>
                {PharmacyDetails?.address} | Phone: {PharmacyDetails?.phone}
              </p>
              <p className={"text-xs " + (isToken ? "" : "")}>
                Email: {PharmacyDetails?.email}{" "}
                {PharmacyDetails.website
                  ? `| Website: ${PharmacyDetails.website}`
                  : ""}
              </p>
              <p className={"text-xs " + (isToken ? "" : "")}>
                D.L.No.: {PharmacyDetails?.dlNumber}{" "}
                {PharmacyDetails.gst
                  ? `| GST No.: ${PharmacyDetails.gst}`
                  : ""}
              </p>
            </div>
            <hr className="my-2" />

            <div
              className={
                (isToken ? "" : "flex") + " justify-around mb-4 text-sm"
              }
            >
              <div>
                <h2 className="text-lg font-semibold mb-2">Patient Details</h2>
                <p>
                  <strong>Name: </strong>
                  <span className="uppercase">
                    {printInvoice.patientId.name}
                  </span>
                </p>
                <p>
                  <strong>Gender/Age:</strong>{" "}
                  <span className="uppercase">
                    {(printInvoice.patientId.gender
                      ? printInvoice.patientId.gender[0]
                      : "-") +
                      "/" +
                      printInvoice.patientId.age}
                  </span>
                </p>
                <p>
                  <strong>Mobile:</strong> {printInvoice.patientId.mobileNumber}
                </p>
                <p>
                  <strong>UHID:</strong> {printInvoice.patientId.uhid}
                </p>
                <p>
                  <strong>Address:</strong> {printInvoice.patientId.address}
                </p>
              </div>
              <div>
                <h2
                  className={
                    (isToken ? "mt-3" : "") + " text-lg font-semibold mb-2"
                  }
                >
                  Invoice Info
                </h2>
                <p>
                  <strong>Invoice ID:</strong> {printInvoice.inid}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  <span className="uppercase">
                    {formatDateTimeToIST(printInvoice.createdAt)}
                  </span>
                </p>
                <p>
                  <strong>Mode of Payment:</strong> {printInvoice.paymentMode}
                </p>
              </div>
            </div>
            <hr className="my-2" />

            <div className="my-3">
              <h2 className="text-lg font-semibold mb-2">Medicine Details</h2>
              <p className="text-sm">
                <strong>Department:</strong> {"Pharmacy"}
              </p>
              <table
                className={(isToken ? "min-w-1/4" : "min-w-full") + " bg-white"}
              >
                <thead>
                  <tr className="text-sm">
                    <th className="p-1 border border-black w-12">Sr.</th>
                    <th className="p-1 border border-black text-start ">
                      Medicine
                    </th>
                    {!isToken && (
                      <>
                        <th className="p-1 border border-black w-16">Qty</th>
                        <th className="py-1 px-2 border border-black w-24">
                          Rate
                        </th>
                        <th className="py-1 px-2 border border-black w-24">
                          Batch
                        </th>
                        <th className="p-1 border border-black w-28">Expiry</th>
                        <th className="p-1 border border-black w-28">
                          Price (₹)
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {printInvoice.medicines.map((item, index) => {
                    const total = item.allocatedStock.reduce(
                      (sum, stock) => {
                        sum.strips += stock.quantity.strips;
                        sum.tablets += stock.quantity.tablets;
                        return sum;
                      },
                      { strips: 0, tablets: 0 }
                    );
                    const totalPrice = item.allocatedStock.reduce(
                      (sum, stock) => {
                        const stripPrice =
                          stock.quantity.strips * stock.sellingPrice;
                        const tabletPrice =
                          stock.quantity.tablets *
                          (stock.sellingPrice /
                            item.medicineId.packetSize.tabletsPerStrip);

                        return sum + stripPrice + tabletPrice;
                      },
                      0
                    );

                    return (
                      <tr key={index} className="text-sm">
                        <td className="p-1 border border-black text-center w-12">
                          {index + 1 + "."}
                        </td>
                        <td className={"p-1 border border-black text-start"}>
                          {item.medicineId.name}
                        </td>
                        {!isToken && (
                          <>
                            <td className="p-1 border border-black text-center w-16">
                              {total.strips +
                                (total.tablets
                                  ? "S/" + total.tablets + "T"
                                  : "")}
                            </td>
                            <td className="py-1 px-2 border border-black text-center w-24">
                              {item.allocatedStock[0].sellingPrice}
                            </td>
                            <td className="py-1 px-2 border border-black text-center w-24">
                              {item.allocatedStock[0].batchName}
                            </td>
                            <td className="p-1 border border-black text-center w-28">
                              {formatDateToIST(
                                item.allocatedStock[0].expiryDate
                              )}
                            </td>
                            <td className="p-1 border border-black text-center w-28">
                              {parseFloat(totalPrice.toFixed(2))}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div
                className={
                  "mt-4 flex flex-col " +
                  (isToken ? "items-start" : "items-end")
                }
              >
                {printInvoice.price.discount && (
                  <>
                    <p className="font-semibold text-lg">
                      Sub Total: ₹ {printInvoice.price.subtotal}
                    </p>
                    <p className="font-semibold text-lg">
                      Discount: {printInvoice.price.discount+"%"}
                    </p>
                  </>
                )}
                <p className="font-semibold text-lg">
                  Grand Total: ₹ {printInvoice.price.total}
                </p>
              </div>
            </div>
            <hr className="my-4" />

            {/* <div className="mb-6 capitalize">
              <h2 className="text-lg font-bold mb-2 ">Doctor Details</h2>
              <p className="text-sm">
                <strong>Doctor Name:</strong> Dr.{" "}
                {printInvoice.doctor.name}
              </p>
              <p className="text-sm">
                <strong>Speciality:</strong>{" "}
                {printInvoice.doctor.specialty}
              </p>
            </div> */}
          </div>

          <hr className="my-4" />

          <div
            className={(isToken ? "text-start" : "text-center") + " text-xs"}
          >
            <p>Thank you for choosing Shivam Akshayvat Hospital</p>
            <p className="mt-1">This is a computer-generated invoice.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default InvoicePharmacy;
