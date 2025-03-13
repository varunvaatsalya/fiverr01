"use client";
import React, { useEffect, useState } from "react";
import { formatDateTimeToIST } from "../utils/date";
import MedicineDetailsSection from "./MedicineDetailsSection";

function MedicineDistribution({ invoices, setInvoices }) {
  const [resData, setResData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [medicineDetails, setMedicineDetails] = useState(null);
  const [medicineDetailsSection, setMedicineDetailsSection] = useState(false);

  useEffect(() => {
    setResData(invoices);
  }, [invoices]);

  return (
    <div>
      <div className="px-2 lg:px-4 max-w-screen-xl mx-auto">
        <div className="h-16 py-2 flex justify-center gap-2 items-center">
          <input
            type="text"
            placeholder="Search"
            // onChange={(e) => {
            //   updatedata(e.target.value);
            // }}
            className="h-full w-full my-3 text-black text-xl font-medium px-4 rounded-full outline-none bg-gray-300 border-b-2 border-gray-400 focus:bg-gray-400"
          />
        </div>
        <div className="h-12 flex justify-center items-center text-xl rounded-full w-full px-2 md:w-4/5 lg:w-3/4 mx-auto bg-black text-white">
          List of all the Pharmacy Invoices
        </div>
        <div className="flex flex-wrap justify-center items-center mx-auto">
          {resData.length > 0 ? (
            resData.map((invoice, index) => (
              <div
                key={index}
                className="text-black w-full px-2 md:w-4/5 lg:w-3/4 mx-auto"
              >
                <div
                  className="px-4 py-2 cursor-pointer border-b-2 border-gray-300 hover:rounded-full hover:bg-gray-300 flex justify-between items-center"
                  onClick={() => {
                    setActiveIndex(activeIndex === index ? null : index);
                    setMedicineDetailsSection(false);
                  }}
                >
                  <div className="">{index + 1}</div>
                  <h3 className="font-semibold text-lg capitalize">
                    {invoice.patientId?.name}
                  </h3>
                  <div className="">{invoice.inid}</div>
                  <div className="flex justify-center items-center gap-2">
                    <span className="text-gray-500 w-4 text-center">
                      {activeIndex === index ? "-" : "+"}
                    </span>
                  </div>
                </div>

                {activeIndex === index && (
                  <div className="w-full px-3 pb-3 bg-gray-200 rounded-b-xl ">
                    <div className="flex flex-wrap gap-x-4 justify-around border-b-2 border-gray-400 py-2">
                      <div className="py-1 px-4 ">
                        UHID:{" "}
                        <span className="text-blue-500 font-semibold">
                          {invoice.patientId?.uhid}
                        </span>
                      </div>
                      <div className="py-1 px-4 ">
                        Payment Mode:{" "}
                        <span className="text-blue-500 font-semibold">
                          {invoice.paymentMode}
                        </span>
                      </div>
                      {invoice.price.discount && (
                        <>
                          <div className="py-1 px-4 ">
                            Subtotal:{" "}
                            <span className="text-blue-500 font-semibold">
                              {invoice.price.subtotal}
                            </span>
                          </div>
                          <div className="py-1 px-4 ">
                            Discount:{" "}
                            <span className="text-blue-500 font-semibold">
                              {invoice.price.discount + "%"}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="py-1 px-4 ">
                        Total:{" "}
                        <span className="text-blue-500 font-semibold">
                          {invoice.price.total}
                        </span>
                      </div>
                      <div className="py-1 px-4 ">
                        Create At:{" "}
                        <span className="text-blue-500 font-semibold uppercase">
                          {formatDateTimeToIST(invoice.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="max-h-[40vh] overflow-y-auto">
                      {invoice.medicines.map((medicine, it) => (
                        <div
                          className="border-b-2 w-full mx-auto border-gray-300 flex flex-wrap"
                          key={it}
                        >
                          <div className="w-1/3 p-2 text-center">
                            {medicine.medicineId.name}
                          </div>
                          <div className="w-1/3 p-2 text-center">
                            {medicine.medicineId.salts.name}
                          </div>
                          <div className="w-1/3 p-2 text-center">
                            {medicine.medicineId.medicineType
                              ? medicine.medicineId.medicineType
                              : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                    {medicineDetailsSection && (
                      <MedicineDetailsSection
                        medicineDetails={medicineDetails}
                        setMedicineDetails={setMedicineDetails}
                        setMedicineDetailsSection={setMedicineDetailsSection}
                        setInvoices={setInvoices}
                        deliveredButton={true}
                      />
                    )}
                    <div className="flex justify-around items-center gap-2 mt-3">
                      <button
                        className="py-2 px-4 text-white bg-slate-900 rounded-lg font-semibold flex gap-1 items-center"
                        onClick={() => {
                          setMedicineDetails(invoice);
                          setMedicineDetailsSection(true);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500 font-semibold text-lg">
              *No Invoice Records
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MedicineDistribution;

// function MedicineDetailsSection({
//   medicineDetails,
//   setMedicineDetails,
//   setMedicineDetailsSection,
// }) {
//   const [submitting, setSubmitting] = useState(false);
//   const [message, setMessage] = useState(null);

//   return (
//     <div className="absolute top-0 left-0">
//       <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
//         <div className="w-[95%] md:w-4/5 lg:w-3/4 text-center bg-slate-950 rounded-xl">
//           <div className="text-center py-2 rounded-t-xl bg-slate-900 text-xl text-white font-semibold">
//             Medicine Details
//           </div>
//           {message && (
//             <div className="my-1 text-center text-red-500">{message}</div>
//           )}
//           <div className="px-2">
//             <div className="flex flex-wrap justify-around items-center p-2 text-white">
//               <div className="py-1 px-4 ">
//                 Name:{" "}
//                 <span className="text-blue-500 font-semibold">
//                   {medicineDetails.patientId?.name}
//                 </span>
//               </div>
//               <div className="py-1 px-4 ">
//                 UHID:{" "}
//                 <span className="text-blue-500 font-semibold">
//                   {medicineDetails.patientId?.uhid}
//                 </span>
//               </div>
//             </div>
//             <div className="max-h-[60vh] overflow-y-auto flex flex-col gap-2">
//               {medicineDetails.medicines.length > 0 ? (
//                 medicineDetails.medicines.map((medicine) => (
//                   <div className="w-full rounded-lg border border-gray-700">
//                     <div className="p-1 border-b border-gray-700 text-white">
//                       <div className="flex justify-around items-center">
//                         <div className="px-3 flex items-center">
//                           {medicine.status && (
//                             <FaCircleDot
//                               className={`w-[5%] min-w-10 ${
//                                 medicine.status === "Fulfilled"
//                                   ? "text-green-500"
//                                   : medicine.status === "Insufficient Stock"
//                                   ? "text-yellow-500"
//                                   : "text-red-500"
//                               }`}
//                             />
//                           )}
//                           <div className="mr-1">Medicine:</div>
//                           <span className="text-blue-500 font-semibold">
//                             {medicine.medicineId.name}
//                           </span>
//                         </div>
//                         <div className="px-3 ">
//                           Place:{" "}
//                           <span className="text-blue-500 font-semibold">
//                             {medicine.medicineId.rackPlace
//                               ? medicine.medicineId.rackPlace.retails
//                               : "N/A"}
//                           </span>
//                         </div>
//                         {medicine.medicineId.isTablets && (
//                           <div className="px-3 ">
//                             Strip Size:{" "}
//                             <span className="text-blue-500 font-semibold">
//                               {medicine.medicineId.packetSize.tabletsPerStrip +
//                                 " Tablets/Strip"}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                     <div className="px-2 py-1">
//                       {medicine.allocatedStock.length > 0 ? (
//                         <>
//                           <div className="mb-1 flex flex-wrap items-center bg-gray-700 rounded-lg  text-sm text-white">
//                             <div className="w-[15%] min-w-24">Batch</div>
//                             <div className="w-[25%] min-w-48">Expiry Date</div>
//                             <div className="w-[20%] min-w-36">Quantity</div>
//                             <div className="w-[15%] min-w-16">MRP</div>
//                             <div className="w-[15%] min-w-20">Subtotal</div>
//                           </div>
//                           {medicine.allocatedStock.map((stock) => (
//                             <div
//                               key={stock._id}
//                               className="flex flex-wrap items-center bg-gray-800 rounded-lg text-sm text-white"
//                             >
//                               <div className="w-[15%] min-w-24">
//                                 {stock.batchName}
//                               </div>
//                               <div className="w-[25%] min-w-48 uppercase">
//                                 {formatDateTimeToIST(stock.expiryDate)}
//                               </div>
//                               <div className="w-[20%] min-w-36">
//                                 {
//                                   <>
//                                     {stock.quantity.strips > 0 &&
//                                       stock.quantity.strips +
//                                         (medicine.medicineId.isTablets
//                                           ? " Strips"
//                                           : " Pcs")}
//                                     {stock.quantity.strips > 0 &&
//                                       stock.quantity.tablets > 0 &&
//                                       ", "}
//                                     {stock.quantity.tablets > 0
//                                       ? stock.quantity.tablets + " Tablets"
//                                       : ""}
//                                   </>
//                                 }
//                               </div>
//                               <div className="w-[15%] min-w-16">
//                                 {stock.sellingPrice}
//                               </div>
//                               <div className="w-[15%] min-w-20">
//                                 {parseFloat(
//                                   (
//                                     stock.quantity.strips * stock.sellingPrice +
//                                     stock.quantity.tablets *
//                                       (stock.sellingPrice /
//                                         medicine.medicineId.packetSize
//                                           .tabletsPerStrip)
//                                   ).toFixed(2)
//                                 )}
//                               </div>
//                             </div>
//                           ))}
//                         </>
//                       ) : (
//                         <div className="text-center">No Stock Available</div>
//                       )}
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-gray-500 font-semibold text-lg">
//                   *No Medicine Records
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="border-t border-gray-700 py-1 flex justify-end gap-2 mt-2 pr-4 text-blue-500">
//             <div className="flex justify-end gap-3 items-center px-2 text-md">
//               <div className="font-semibold text-center">Total:</div>
//               <div className="text-white">
//                 {medicineDetails.price.subtotal + "/-"}
//               </div>
//             </div>
//             <div className="flex justify-end gap-3 items-center px-2 text-md">
//               <div className="font-semibold text-center">Discount:</div>
//               <div className="text-white">
//                 {medicineDetails.price.discount
//                   ? medicineDetails.price.discount + "%"
//                   : "--"}
//               </div>
//             </div>
//             <div className="flex justify-end gap-3 items-center px-2 text-md">
//               <div className="font-semibold text-center">Grand Total:</div>
//               <div className="text-white">
//                 {medicineDetails.price.total + "/-"}
//               </div>
//             </div>
//           </div>
//           <hr className="border-t border-slate-900 w-full my-2" />
//           <div className="flex px-4 gap-3 my-3 justify-end">
//             <div
//               className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
//               onClick={() => {
//                 setMedicineDetailsSection(false);
//                 setMedicineDetails(false);
//               }}
//             >
//               Cancel
//             </div>
//             <button
//               // onClick={
//               //   requestedMedicineDetails && selectedPaymentMode
//               //     ? handleConfirm
//               //     : onSubmit
//               // }
//               className="w-20 h-8 py-1 flex items-center justify-center gap-2 rounded-lg font-semibold bg-green-500 text-white disabled:bg-gray-600"
//               disabled={submitting}
//             >
//               {submitting ? <Loading size={15} /> : <></>}
//               {submitting ? "Wait..." : "Confirm"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
