import React, { useEffect, useState } from "react";
import { formatDateTimeToIST, timeDifference } from "../utils/date";
import { useRouter } from "next/navigation";
import { PiSealWarningBold } from "react-icons/pi";

let data = {
  surgerys: [
    { name: "sdc", price: 1254 },
    { name: "thy", price: 1254 },
    { name: "erd", price: 1254 },
    { name: "erd", price: 1254 },
    { name: "kol", price: 1254 },
    { name: "fgt", price: 1254 },
    { name: "mlk", price: 1254 },
  ],
  packages: [
    { name: "bgf", items: ["bhg", "gdr", "gyh", "tyu"], price: 1854 },
    { name: "dtg", items: ["bhg", "gdr", "gyh", "tyu"], price: 1854 },
    { name: "erf", items: ["bhg", "gdr", "gyh", "tyu"], price: 1854 },
    { name: "nhj", items: ["bhg", "gdr", "gyh", "tyu"], price: 1854 },
  ],
  doctors: [
    { name: "bgf", price: 2254 },
    { name: "dtg", price: 2254 },
    { name: "erf", price: 2254 },
    { name: "nhj", price: 2254 },
  ],
  reason: "pyaar me andhi ho gyi thi",
};

// function AdmissionForm({ bed, setBed }) {
function AdmissionForm({ admission, setAdmission, insurenceDetails }) {
  const [data, setData] = useState(null);
  const [activeAddOns, setActiveAddOns] = useState(null);
  const [activeReason, setActiveReason] = useState(null);
  const [activeInsurence, setActiveInsurence] = useState(null);
  const [activeSupplementary, setActiveSupplementary] = useState(null);
  const [activeBedOperations, setActiveBedOperations] = useState(null);
  const [activeOtherServices, setActiveOtherServices] = useState(null);
  const [activePaymentSummery, setActivePaymentSummery] = useState(null);
  const [activeChargeBalence, setActiveChargeBalence] = useState(null);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [bedHistory, setBedHistory] = useState(null);
  const [chargeBalenceDetails, setChargeBalenceDetails] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [insurenceDeatils, setInsurenceDeatils] = useState({
    providerName: admission?.insuranceInfo?.providerName || "",
    tpa: admission?.insuranceInfo?.tpa || "",
    coverageAmount: admission?.insuranceInfo?.coverageAmount || "",
  });
  const [transaction, setTransaction] = useState({
    amount: "",
    txno: "",
    bankName: "",
  });

  useEffect(() => {}, [bedHistory, availableBeds]);

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch(`/api/admission`);
        result = await result.json();
        if (result.success) {
          setData({
            surgerys: result.surgerys,
            packages: result.packages,
            doctors: result.doctors,
          });
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);

  async function onInsurenceInfoSubmit() {
    try {
      setMessage(null);
      setSubmitting(true);
      let result = await fetch(`/api/ipdRecords`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify({
          id: admission,
          insurenceDeatils,
          transaction,
        }),
      });
      result = await result.json();

      if (result.success) {
        setAdmission((admission) => ({
          ...admission,
          insuranceInfo: {
            ...admission.insuranceInfo,
            payments: result.transaction,
          },
        }));
        setTransaction({ amount: "", txno: "", bankName: "" });
        setChargeBalenceDetails(null);
      }
      setMessage(result.message);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFetchBedDeatils() {
    async function fetchData() {
      setMessage(null);
      setSubmitting(true);
      try {
        let result = await fetch(`/api/admissionWorks?id=${admission._id}`);
        result = await result.json();
        if (result.success) {
          setAvailableBeds(result.availableBeds);
          setBedHistory(result.bedHistory);
        }
        setMessage(result.message);
      } catch (err) {
        console.log("error: ", err);
      } finally {
        setSubmitting(false);
      }
    }
    fetchData();
  }

  async function handleInsurenceInfo(e) {
    const { name, value } = e.target;
    setInsurenceDeatils((prevInsurenceInfo) => ({
      ...prevInsurenceInfo,
      [name]: value,
    }));
  }

  async function handlePaymentInfo(e) {
    const { name, value } = e.target;
    setTransaction((prevTransaction) => ({
      ...prevTransaction,
      [name]: value,
    }));
  }

  async function handleGetChargeBalenceDetails() {
    async function fetchData() {
      setMessage(null);
      setSubmitting(true);
      try {
        let result = await fetch(
          `/api/admissionWorks?id=${admission._id}&paymentSummery=1`
        );
        result = await result.json();
        if (result.success) {
          setChargeBalenceDetails(result.paymentDetails);
        }
        setMessage(result.message);
      } catch (err) {
        console.log("error: ", err);
      } finally {
        setSubmitting(false);
      }
    }
    fetchData();
  }

  return (
    <>
      <div className="bg-gray-700 my-2 w-full mx-auto md:w-3/4 p-2 rounded-xl">
        <div className="flex flex-wrap justify-center p-2">
          <div className="px-2">
            Admission ID:{" "}
            <span className="text-blue-300 font-semibold">
              {admission.adid}
            </span>
          </div>
          <div className="px-2">
            CreatedAt:{" "}
            <span className="text-blue-300 font-semibold uppercase">
              {formatDateTimeToIST(admission.createdAt)}
            </span>
          </div>
        </div>
        <div className="text-center text-2xl font-semibold">Add Ons</div>
        {message && (
          <div className="my-1 px-4 text-center text-red-400">{message}</div>
        )}
        <div
          className="w-3/4 mx-auto px-6 py-2 cursor-pointer border-b-2 border-gray-800 bg-slate-600 rounded-full hover:bg-gray-800 flex justify-between items-center"
          onClick={() => {
            setActiveAddOns(activeAddOns === 0 ? null : 0);
          }}
        >
          <h3 className="font-semibold text-lg capitalize">Surgery</h3>
          <span className="text-gray-300">
            {activeAddOns === 0 ? "-" : "+"}
          </span>
        </div>
        {activeAddOns === 0 && (
          <div className="bg-slate-800 p-4 w-3/4 mx-auto my-1 rounded-xl">
            {admission.surgery.length > 0 ? (
              admission.surgery.map((history, index) => {
                const surgery = data.surgerys.find(
                  (surgery) => surgery._id === history.surgery
                );
                return (
                  <div
                    className="w-full md:w-4/5 px-3 py-1 border-b border-gray-600 mx-auto flex justify-between items-center text-sm"
                    key={index}
                  >
                    <div className="w-2/5">{surgery.name}</div>
                    <div>{surgery.price}</div>
                    <div className="uppercase">
                      {formatDateTimeToIST(history.date)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400">No Surgery</div>
            )}
          </div>
        )}
        <div
          className="w-3/4 mx-auto px-6 py-2 cursor-pointer border-b-2 border-gray-800 bg-slate-600 rounded-full hover:bg-gray-800 flex justify-between items-center"
          onClick={() => {
            setActiveAddOns(activeAddOns === 1 ? null : 1);
          }}
        >
          <h3 className="font-semibold text-lg capitalize">Doctor Visit</h3>
          <span className="text-gray-300">
            {activeAddOns === 1 ? "-" : "+"}
          </span>
        </div>
        {activeAddOns === 1 && (
          <div className="bg-slate-800 p-4 w-3/4 mx-auto my-1 rounded-xl">
            {admission.doctor.length > 0 ? (
              admission.doctor.map((history, index) => {
                const doctor = data.doctors.find(
                  (doctor) => doctor._id === history.doctor
                );
                return (
                  <div
                    className="w-full md:w-4/5 px-3 py-1 border-b border-gray-600 mx-auto flex justify-between items-center text-sm"
                    key={index}
                  >
                    <div className="w-2/5">{doctor.name}</div>
                    <div>{doctor.charge}</div>
                    <div className="uppercase">
                      {formatDateTimeToIST(history.visitingDate)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400">No Visit</div>
            )}
          </div>
        )}
        <div
          className="w-3/4 mx-auto px-6 py-2 cursor-pointer border-b-2 border-gray-800 bg-slate-600 rounded-full hover:bg-gray-800 flex justify-between items-center"
          onClick={() => {
            setActiveAddOns(activeAddOns === 2 ? null : 2);
          }}
        >
          <h3 className="font-semibold text-lg capitalize">Packages</h3>
          <span className="text-gray-300">
            {activeAddOns === 2 ? "-" : "+"}
          </span>
        </div>
        {activeAddOns === 2 && (
          <div className="bg-slate-800 p-4 w-3/4 mx-auto my-1 rounded-xl">
            {admission.package.length > 0 ? (
              admission.package.map((history, index) => {
                const Package = data.packages.find(
                  (Package) => Package._id === history.package
                );
                return (
                  <div
                    className="w-full md:w-4/5 px-3 py-1 border-b border-gray-600 mx-auto flex justify-between items-center text-sm"
                    key={index}
                  >
                    <div className="w-2/5">{Package.name}</div>
                    <div>{Package.price}</div>
                    <div className="uppercase">
                      {formatDateTimeToIST(history.date)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400">No Package</div>
            )}
          </div>
        )}
      </div>
      <div className="bg-gray-700 my-2 w-full mx-auto md:w-3/4 rounded-xl">
        <div
          onClick={() => {
            setActiveReason(!activeReason);
          }}
          className="hover:bg-gray-800 cursor-pointer py-2 px-4 rounded-xl flex justify-between"
        >
          <div className="text-center text-2xl font-semibold px-4">Reason</div>
          <div>{activeReason ? "-" : "+"}</div>
        </div>
        {activeReason && (
          <div className="rounded-lg p-3 my-2 w-3/4 mx-auto bg-slate-900">
            {admission.reason}
          </div>
        )}
      </div>
      <div className="bg-gray-700 my-2 w-full mx-auto md:w-3/4 rounded-xl">
        <div
          onClick={() => {
            setActiveInsurence(!activeInsurence);
          }}
          className="hover:bg-gray-800 cursor-pointer py-2 px-4 rounded-xl flex justify-between items-center"
        >
          <div className="text-center text-2xl font-semibold px-4">
            Insurence Details
          </div>
          <div>{activeInsurence ? "-" : "+"}</div>
        </div>
        {activeInsurence && (
          <>
            <div className="w-full flex justify-center">
              <div className="flex flex-col md:flex-row my-2 justify-center items-center gap-2 w-4/5">
                <input
                  type="text"
                  name="providerName"
                  className="rounded-lg p-3 w-full mx-auto bg-slate-900 outline outline-gray-600"
                  placeholder="Insurence Provider Name"
                  value={insurenceDeatils.providerName}
                  onChange={handleInsurenceInfo}
                  readOnly={!insurenceDetails}
                  required
                />
                <input
                  type="text"
                  name="tpa"
                  className="rounded-lg p-3 w-full mx-auto bg-slate-900 outline outline-gray-600"
                  placeholder="TPA"
                  value={insurenceDeatils.tpa}
                  onChange={handleInsurenceInfo}
                  readOnly={!insurenceDetails}
                />
                <input
                  type="number"
                  min={0}
                  name="coverageAmount"
                  className="rounded-lg p-3 w-full md:w-48 mx-auto bg-slate-900 outline outline-gray-600"
                  placeholder="Coverage Amount"
                  value={insurenceDeatils.coverageAmount}
                  onChange={handleInsurenceInfo}
                  readOnly={!insurenceDetails}
                  required
                />
              </div>
            </div>
            <div className="bg-slate-800 p-4 w-3/4 mx-auto my-1 rounded-xl">
              <div className="text-center text-lg font-semibold my-1">
                Payments
              </div>

              {admission.insuranceInfo &&
              admission.insuranceInfo.payments.length > 0 ? (
                admission.insuranceInfo.payments.map((payment, index) => {
                  return (
                    <div
                      className="w-full md:w-4/5 px-3 py-1 border-b border-gray-600 mx-auto flex justify-around items-center text-sm"
                      key={index}
                    >
                      <div>{payment.amount}</div>
                      <div>{payment.txno}</div>
                      <div>{payment.bankName}</div>
                      <div>{formatDateTimeToIST(payment.date)}</div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400">No Payments</div>
              )}

              {insurenceDetails && (
                <div className="p-2 w-full md:w-4/5 mx-auto flex flex-wrap justify-center items-center gap-2 bg-slate-700 my-2 rounded-lg">
                  <input
                    type="number"
                    min={0}
                    placeholder="Payments"
                    name="amount"
                    value={transaction.amount}
                    onChange={handlePaymentInfo}
                    className="py-1 px-2 w-2/5 bg-gray-800 rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Txn No."
                    name="txno"
                    value={transaction.txno}
                    onChange={handlePaymentInfo}
                    className="py-1 px-2 w-2/5 bg-gray-800 rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Bank Name"
                    name="bankName"
                    value={transaction.bankName}
                    onChange={handlePaymentInfo}
                    className="py-1 px-2 w-2/5 bg-gray-800 rounded-lg"
                    required
                  />
                  <button
                    onClick={onInsurenceInfoSubmit}
                    className="bg-red-500 hover:bg-red-700 px-4 py-1 rounded-lg"
                    disabled={!insurenceDeatils.providerName}
                  >
                    {submitting ? "Submiting..." : "Submit"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div className="bg-gray-700 my-2 w-full mx-auto md:w-3/4 rounded-xl">
        <div
          onClick={() => {
            setActiveBedOperations(!activeBedOperations);
          }}
          className="hover:bg-gray-800 cursor-pointer py-2 px-4 rounded-xl flex justify-between items-center"
        >
          <div className="text-center text-2xl font-semibold px-4">
            Bed Operations
          </div>
          <div>{activeBedOperations ? "-" : "+"}</div>
        </div>
        {activeBedOperations && (
          <>
            {bedHistory ? (
              <>
                <div className="bg-slate-800 px-4 py-2 w-[90%] mx-auto my-1 rounded-xl">
                  <div className="text-center text-lg font-semibold my-1">
                    Bed History
                  </div>
                  <div className="w-full px-3 py-1 my-2 border-b-2 border-gray-600 mx-auto flex justify-around items-center text-sm">
                    <div className="w-[15%] text-center font-semibold text-base">
                      Ward
                    </div>
                    <div className="w-[15%] text-center font-semibold text-base">
                      Bed
                    </div>
                    <div className="w-[30%] text-center font-semibold text-base">
                      Admit Date
                    </div>
                    <div className="w-[30%] text-center font-semibold text-base">
                      Discharge Date
                    </div>
                    <div className="w-[10%] text-center font-semibold text-base">
                      Duration
                    </div>
                  </div>
                  {bedHistory.map((bh, index) => (
                    <div
                      className="w-full px-3 py-1 border-b border-gray-600 mx-auto flex justify-around items-center text-sm"
                      key={index}
                    >
                      <div className="w-[15%] text-center">{bh.ward}</div>
                      <div className="w-[15%] text-center">{bh.bedName}</div>
                      <div className="w-[30%] text-center uppercase">
                        {formatDateTimeToIST(bh.startDate)}
                      </div>
                      <div className="w-[30%] text-center uppercase">
                        {bh.endDate ? formatDateTimeToIST(bh.endDate) : "-"}
                      </div>
                      <div className="w-[10%] text-center">
                        {timeDifference(bh.startDate, bh.endDate)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-800 px-4 py-2 w-[90%] mx-auto my-1 flex flex-col items-center rounded-xl">
                  <div className="text-center text-lg font-semibold my-1">
                    Get Bed Details
                  </div>
                  <button
                    onClick={handleFetchBedDeatils}
                    className="bg-green-500 hover:bg-green-700 px-4 py-1 rounded-lg font-semibold"
                  >
                    {submitting ? "Processing..." : "Get"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <div className="bg-gray-700 my-2 w-full mx-auto md:w-3/4 rounded-xl">
        <div
          onClick={() => {
            setActiveSupplementary(!activeSupplementary);
          }}
          className="hover:bg-gray-800 cursor-pointer py-2 px-4 rounded-xl flex justify-between items-center"
        >
          <div className="text-center text-2xl font-semibold px-4">
            Supplementary Expenses Summery
          </div>
          <div>{activeSupplementary ? "-" : "+"}</div>
        </div>
        {activeSupplementary && (
          <>
            <div className="bg-slate-800 p-4 w-3/4 mx-auto my-1 rounded-xl">
              <div className="text-center text-lg font-semibold my-1">
                Supplementary History
              </div>

              {admission.supplementaryService &&
              admission.supplementaryService.length > 0 ? (
                admission.supplementaryService.map((suppService, index) => {
                  return (
                    <div
                      className="w-full md:w-4/5 px-3 py-1 border-b border-gray-600 mx-auto flex justify-around items-center text-sm"
                      key={index}
                    >
                      <div>{suppService.name}</div>
                      <div>{suppService.amount}</div>
                      <div>{formatDateTimeToIST(suppService.date)}</div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400">No Records</div>
              )}
            </div>
          </>
        )}
      </div>
      <div className="bg-gray-700 my-2 w-full mx-auto md:w-3/4 rounded-xl">
        <div
          onClick={() => {
            setActiveOtherServices(!activeOtherServices);
          }}
          className="hover:bg-gray-800 cursor-pointer py-2 px-4 rounded-xl flex justify-between items-center"
        >
          <div className="text-center text-2xl font-semibold px-4">
            Other Services
          </div>
          <div>{activeOtherServices ? "-" : "+"}</div>
        </div>
        {activeOtherServices && (
          <>
            <div className="bg-slate-800 p-4 w-3/4 mx-auto my-1 rounded-xl">
              <div className="text-center text-lg font-semibold my-1">
                Other Services
              </div>

              {admission.otherServices && admission.otherServices.length > 0 ? (
                admission.otherServices.map((othSer, index) => {
                  return (
                    <div
                      className="w-full md:w-4/5 px-3 py-1 border-b border-gray-600 mx-auto flex justify-around items-center text-sm"
                      key={index}
                    >
                      <div>{othSer.name}</div>
                      <div>{othSer.amount}</div>
                      <div>{formatDateTimeToIST(othSer.date)}</div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400">
                  No Any other services
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div className="bg-gray-700 my-2 w-full mx-auto md:w-3/4 rounded-xl">
        <div
          onClick={() => {
            setActivePaymentSummery(!activePaymentSummery);
          }}
          className="hover:bg-gray-800 cursor-pointer py-2 px-4 rounded-xl flex justify-between items-center"
        >
          <div className="text-center text-2xl font-semibold px-4">
            IPD Invoice Summery
          </div>
          <div>{activePaymentSummery ? "-" : "+"}</div>
        </div>
        {activePaymentSummery && (
          <>
            <div className="bg-slate-800 p-4 w-3/4 mx-auto my-1 rounded-xl">
              <div className="text-center text-lg font-semibold my-1">
                Payments History
              </div>

              {admission.ipdPayments && admission.ipdPayments.length > 0 ? (
                admission.ipdPayments.map((payment, index) => {
                  return (
                    <div
                      className="w-full md:w-4/5 px-3 py-1 border-b border-gray-600 mx-auto flex justify-around items-center text-sm"
                      key={index}
                    >
                      <div>{payment.name}</div>
                      <div>{payment.amount}</div>
                      <div>{formatDateTimeToIST(payment.date)}</div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400">
                  No Payments Records
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div className="bg-gray-700 my-2 w-full mx-auto md:w-3/4 rounded-xl">
        <div
          onClick={() => {
            setActiveChargeBalence(!activeChargeBalence);
          }}
          className="hover:bg-gray-800 cursor-pointer py-2 px-4 rounded-xl flex justify-between items-center"
        >
          <div className="text-center text-2xl font-semibold px-4">
            Charges Payments Balance
          </div>
          <div>{activeChargeBalence ? "-" : "+"}</div>
        </div>
        {activeChargeBalence && (
          <>
            {chargeBalenceDetails ? (
              <>
                <div className="bg-slate-800 px-4 py-2 w-[90%] mx-auto my-1 rounded-xl">
                  <div className="text-center text-lg font-semibold my-1">
                    Charges Deatils
                  </div>
                  <div className="w-full px-3 py-1 my-2 border-b-2 border-gray-600 mx-auto flex justify-around items-center text-sm">
                    <div className="text-center font-semibold text-base">
                      Charges
                    </div>
                    <div className="text-center font-semibold text-base">
                      SubTotal
                    </div>
                  </div>
                  <div className="w-full px-3 py-1 border-b border-gray-600 mx-auto flex justify-around items-center text-sm">
                    <div className="text-center w-full">Beds Charge</div>
                    <div className="text-center w-full">
                      {chargeBalenceDetails.bedCharges}
                    </div>
                  </div>
                  <div className="w-full px-3 py-1 border-b border-gray-600 mx-auto flex justify-around items-center text-sm">
                    <div className="text-center w-full">Surgery Charge</div>
                    <div className="text-center w-full">
                      {chargeBalenceDetails.surgeryCharges}
                    </div>
                  </div>
                  <div className="w-full px-3 py-1 border-b border-gray-600 mx-auto flex justify-around items-center text-sm">
                    <div className="text-center w-full">Doctor Charge</div>
                    <div className="text-center w-full">
                      {chargeBalenceDetails.doctorCharges}
                    </div>
                  </div>
                  <div className="w-full px-3 py-1 border-b border-gray-600 mx-auto flex justify-around items-center text-sm">
                    <div className="text-center w-full">Packags Charge</div>
                    <div className="text-center w-full">
                      {chargeBalenceDetails.packageCharges}
                    </div>
                  </div>
                  <div className="w-full px-3 py-1 border-b border-gray-600 mx-auto flex justify-around items-center text-sm">
                    <div className="text-center w-full">
                      Supplementary Charge
                    </div>
                    <div className="text-center w-full">
                      {chargeBalenceDetails.supplementaryCharges}
                    </div>
                  </div>
                  <div className="w-full px-3 py-1 border-b-2 border-gray-600 mx-auto flex justify-around items-center text-sm">
                    <div className="text-center w-full">
                      Other Service Charge
                    </div>
                    <div className="text-center w-full">
                      {chargeBalenceDetails.otherServiceCharges}
                    </div>
                  </div>
                  <div className="w-full px-3 py-2 mx-auto flex justify-around items-center font-semibold">
                    <div className="text-center w-full">Total</div>
                    <div className="text-center w-full">
                      {chargeBalenceDetails.totalCharges}
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800 px-4 py-2 w-[90%] mx-auto my-1 rounded-xl">
                  <div className="text-center text-lg font-semibold my-1">
                    Payments Deatils
                  </div>
                  <div className="w-full px-3 py-1 my-2 border-b-2 border-gray-600 mx-auto flex justify-around items-center text-sm">
                    <div className="text-center w-full font-semibold text-base">
                      Payments
                    </div>
                    <div className="text-center w-full font-semibold text-base">
                      SubTotal
                    </div>
                  </div>
                  <div className="w-full px-3 py-1 border-b border-gray-600 mx-auto flex justify-around items-center text-sm">
                    <div className="text-center w-full">
                      IPD Invoice Payments
                    </div>
                    <div className="text-center w-full">
                      {chargeBalenceDetails.ipdPayments}
                    </div>
                  </div>
                  <div className="w-full px-3 py-1 border-b-2 border-gray-600 mx-auto flex justify-around items-center text-sm">
                    <div className="text-center w-full">Insurance Payments</div>
                    <div className="text-center w-full">
                      {chargeBalenceDetails.insurancePayments}
                    </div>
                  </div>
                  <div className="w-full px-3 py-2 mx-auto flex justify-around items-center font-semibold">
                    <div className="text-center w-full">Total</div>
                    <div className="text-center w-full">
                      {chargeBalenceDetails.totalPayments}
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800 px-4 py-2 w-[90%] mx-auto my-1 rounded-xl">
                  <div className="text-center text-lg font-semibold my-1">
                    Balance Deatils
                  </div>
                  <div className="w-full px-3 py-1 my-2 mx-auto flex justify-around items-center text-xl">
                    <div className="text-center font-bold w-full">Balance</div>
                    <div
                      className={
                        "text-center font-bold w-full " +
                        (chargeBalenceDetails.balance <= 0
                          ? "text-green-400"
                          : "text-red-400")
                      }
                    >
                      {chargeBalenceDetails.balance}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-800 px-4 py-2 w-[90%] mx-auto my-1 flex flex-col items-center rounded-xl">
                  <div className="text-center text-lg font-semibold my-1">
                    Get Balance Details
                  </div>

                  <button
                    onClick={handleGetChargeBalenceDetails}
                    className="bg-green-500 hover:bg-green-700 px-4 py-1 rounded-lg font-semibold"
                  >
                    {submitting ? "Processing..." : "Get"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default AdmissionForm;
