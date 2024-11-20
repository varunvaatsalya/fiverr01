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

function AdmissionForm({ bed, setBed }) {
  const router = useRouter();

  const [data, setData] = useState(null);
  const [activeAddOns, setActiveAddOns] = useState(null);
  const [activeDropDown, setActiveDropDown] = useState(null);
  const [reason, setReason] = useState(bed.occupancy.admissionId.reason);
  const [activeReason, setActiveReason] = useState(null);
  const [activeInsurence, setActiveInsurence] = useState(null);
  const [activeSupplementary, setActiveSupplementary] = useState(null);
  const [activeBedOperations, setActiveBedOperations] = useState(null);
  const [activeOtherServices, setActiveOtherServices] = useState(null);
  const [activePaymentSummery, setActivePaymentSummery] = useState(null);
  const [activeChargeBalence, setActiveChargeBalence] = useState(null);
  const [selectedSurgeries, setSelectedSurgeries] = useState([]);
  const [selectedDoctorVisiting, setSelectedDoctorVisiting] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [bedHistory, setBedHistory] = useState(null);
  const [chargeBalenceDetails, setChargeBalenceDetails] = useState(null);
  const [changeingBedId, setChangeingBedId] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [takeConfirmDischarge, setTakeConfirmDischarge] = useState(false);
  const [insurenceDeatils, setInsurenceDeatils] = useState({
    providerName: bed.occupancy.admissionId?.insuranceInfo?.providerName || "",
    tpa: bed.occupancy.admissionId?.insuranceInfo?.tpa || "",
    coverageAmount:
      bed.occupancy.admissionId?.insuranceInfo?.coverageAmount || "",
  });
  const [transaction, setTransaction] = useState({
    amount: "",
    txno: "",
    bankName: "",
  });
  const [othServices, setOthServices] = useState({
    name: "",
    amount: "",
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

  const handleSurgeryChange = (surgery) => {
    if (selectedSurgeries.includes(surgery._id)) {
      setSelectedSurgeries(selectedSurgeries.filter((s) => s !== surgery._id));
    } else {
      setSelectedSurgeries([...selectedSurgeries, surgery._id]);
    }
  };
  const handleDoctorVisiting = (doctor) => {
    if (selectedDoctorVisiting.includes(doctor._id)) {
      setSelectedDoctorVisiting(
        selectedDoctorVisiting.filter((s) => s !== doctor._id)
      );
    } else {
      setSelectedDoctorVisiting([...selectedDoctorVisiting, doctor._id]);
    }
  };
  const handlePackage = (Package) => {
    if (selectedPackage.includes(Package._id)) {
      setSelectedPackage(selectedPackage.filter((s) => s !== Package._id));
    } else {
      setSelectedPackage([...selectedPackage, Package._id]);
    }
  };

  async function handleAddOns() {
    try {
      setMessage(null);
      setSubmitting(true);
      let result = await fetch(`/api/admissionWorks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify({
          id: bed.occupancy.admissionId,
          surgerys: selectedSurgeries,
          packages: selectedPackage,
          doctors: selectedDoctorVisiting,
          reason,
        }),
      });
      result = await result.json();

      if (result.success) {
        setBed((prevBed) => ({
          ...prevBed,
          occupancy: {
            ...prevBed.occupancy,
            admissionId: {
              ...prevBed.occupancy.admissionId,
              doctor: result.doctors,
              surgery: result.surgerys,
              package: result.packages,
            },
          },
        }));
        setChargeBalenceDetails(null);
      }
      setMessage(result.message);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function onInsurenceInfoSubmit() {
    try {
      setMessage(null);
      setSubmitting(true);
      let result = await fetch(`/api/admissionWorks?insurenceInfo=1`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify({
          id: bed.occupancy.admissionId,
          insurenceDeatils,
          transaction,
        }),
      });
      result = await result.json();

      if (result.success) {
        setBed((prevBed) => ({
          ...prevBed,
          occupancy: {
            ...prevBed.occupancy,
            admissionId: {
              ...prevBed.occupancy.admissionId,
              insuranceInfo: {
                ...prevBed.occupancy.insuranceInfo,
                payments: result.transaction,
              },
            },
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

  async function onOthServiceSubmit() {
    if (othServices.amount && othServices.name) {
      try {
        setMessage(null);
        setSubmitting(true);
        let result = await fetch(`/api/admissionWorks?othServiceInfo=1`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set the header for JSON
          },
          body: JSON.stringify({
            id: bed.occupancy.admissionId,
            othServices,
          }),
        });
        result = await result.json();

        if (result.success) {
          setBed((prevBed) => ({
            ...prevBed,
            occupancy: {
              ...prevBed.occupancy,
              admissionId: {
                ...prevBed.occupancy.admissionId,
                otherServices: result.otherServices,
              },
            },
          }));
          setOthServices({ amount: "", name: "" });
          setChargeBalenceDetails(null);
        }
        setMessage(result.message);
      } catch (error) {
        console.error("Error submitting application:", error);
      } finally {
        setSubmitting(false);
      }
    } else {
      setMessage("fill the details correctly");
    }
  }

  async function handleFetchBedDeatils() {
    async function fetchData() {
      setMessage(null);
      setSubmitting(true);
      try {
        let result = await fetch(
          `/api/admissionWorks?id=${bed.occupancy.admissionId._id}`
        );
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

  async function handleBedChange() {
    try {
      if (changeingBedId) {
        setMessage(null);
        setSubmitting(true);
        let result = await fetch(`/api/admission?id=1`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set the header for JSON
          },
          body: JSON.stringify({
            patientId: bed.occupancy.patientId._id,
            newBedId: changeingBedId,
          }),
        });
        result = await result.json();

        if (result.success) {
          const currentUrl = window.location.href;
          const updatedUrl = currentUrl.replace(
            /works\/[^/]+$/,
            `works/${result.newBedId}`
          );
          console.log(updatedUrl);
          router.push(updatedUrl);
        }
        setMessage(result.message);
      } else {
        setMessage("Select the bed");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
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

  async function handleOthInfo(e) {
    const { name, value } = e.target;
    setOthServices((prevOthServices) => ({
      ...prevOthServices,
      [name]: value,
    }));
  }

  async function handleGetChargeBalenceDetails() {
    async function fetchData() {
      setMessage(null);
      setSubmitting(true);
      try {
        let result = await fetch(
          `/api/admissionWorks?id=${bed.occupancy.admissionId._id}&paymentSummery=1`
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
  async function handlePatientDischarge() {
    async function fetchData() {
      setMessage(null);
      setSubmitting(true);
      try {
        let result = await fetch(
          `/api/admissionWorks?id=${bed.occupancy.admissionId._id}&discharge=1`
        );
        result = await result.json();
        if (result.success) {
          const currentUrl = window.location.href;
          const basePath = currentUrl.split("/").slice(0, -1).join("/");
          router.push(basePath);
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
      <div className="bg-gray-800 flex justify-center gap-4 py-2 w-full text-xl rounded-full mx-auto md:w-3/5 lg:w-[45%]">
        <div className="">
          Patient:{" "}
          <span className="text-blue-400 font-semibold">
            {bed.occupancy.patientId.name}
          </span>
        </div>
        <div className="">
          UHID:{" "}
          <span className="text-blue-400 font-semibold">
            {bed.occupancy.patientId.uhid}
          </span>
        </div>
      </div>
      <div className="bg-gray-700 my-2 w-full mx-auto md:w-3/4 p-2 rounded-xl">
        <div className="flex flex-wrap justify-center p-2">
          <div className="px-2">
            Admission ID:{" "}
            <span className="text-blue-300 font-semibold">
              {bed.occupancy.admissionId.adid}
            </span>
          </div>
          <div className="px-2">
            CreatedAt:{" "}
            <span className="text-blue-300 font-semibold uppercase">
              {formatDateTimeToIST(bed.occupancy.admissionId.createdAt)}
            </span>
          </div>
        </div>
        <div className="text-center text-2xl font-semibold">Add Ons</div>
        <div className="px-3 my-1 w-full mx-auto md:w-3/4 flex">
          <button
            onClick={handleAddOns}
            className="text-lg bg-red-500 hover:bg-red-700 py-1 px-3 rounded-lg"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
          {message && (
            <div className="my-1 px-4 text-center text-red-400">{message}</div>
          )}
        </div>
        <div
          className="w-3/4 mx-auto px-6 py-2 cursor-pointer border-b-2 border-gray-800 bg-slate-600 rounded-full hover:bg-gray-800 flex justify-between items-center"
          onClick={() => {
            setActiveAddOns(activeAddOns === 0 ? null : 0);
            setActiveDropDown(null);
          }}
        >
          <h3 className="font-semibold text-lg capitalize">Surgery</h3>
          <span className="text-gray-300">
            {activeAddOns === 0 ? "-" : "+"}
          </span>
        </div>
        {activeAddOns === 0 && (
          <div className="bg-slate-800 p-4 w-3/4 mx-auto my-1 rounded-xl">
            {bed.occupancy.admissionId.surgery.length > 0 ? (
              bed.occupancy.admissionId.surgery.map((history, index) => {
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
            <div className="p-2 w-full md:w-4/5 mx-auto bg-slate-700 my-2 rounded-lg">
              <div
                className="relative py-1 px-2 flex justify-between w-1/2 bg-gray-800 mx-auto rounded-lg"
                onClick={() => {
                  setActiveDropDown(activeDropDown === 1 ? null : 1);
                }}
              >
                <div className="">Add Surgery</div>
                <div className="">{activeDropDown == 1 ? "-" : "+"}</div>
              </div>
              {activeDropDown == 1 && (
                <div className="p-2 w-1/2 mx-auto my-1 bg-slate-600 rounded overflow-y-auto max-h-60">
                  {data.surgerys.map((Surgery, index) => (
                    <div
                      className="flex items-center justify-center border-b border-gray-500 gap-3 px-2 font-medium"
                      key={index}
                    >
                      <input
                        type="checkbox"
                        className="size-4 cursor-pointer"
                        checked={selectedSurgeries.includes(Surgery._id)}
                        onChange={() => handleSurgeryChange(Surgery)}
                      />
                      <div>
                        {Surgery.name} - {Surgery.price}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedSurgeries.length > 0 && (
                <div className="my-1 font-semibold text-center">
                  Selected Items
                </div>
              )}
              {selectedSurgeries.map((surgeryId, index) => {
                const surgery = data.surgerys.find(
                  (surgery) => surgery._id === surgeryId
                );
                return (
                  <div
                    key={index}
                    className="w-1/2 py-1 px-3 border-b border-gray-600 mx-auto flex justify-between items-center text-sm"
                  >
                    <div className="w-2/5">{surgery.name}</div>
                    <div>{surgery.price}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div
          className="w-3/4 mx-auto px-6 py-2 cursor-pointer border-b-2 border-gray-800 bg-slate-600 rounded-full hover:bg-gray-800 flex justify-between items-center"
          onClick={() => {
            setActiveAddOns(activeAddOns === 1 ? null : 1);
            setActiveDropDown(null);
          }}
        >
          <h3 className="font-semibold text-lg capitalize">Doctor Visit</h3>
          <span className="text-gray-300">
            {activeAddOns === 1 ? "-" : "+"}
          </span>
        </div>
        {activeAddOns === 1 && (
          <div className="bg-slate-800 p-4 w-3/4 mx-auto my-1 rounded-xl">
            {bed.occupancy.admissionId.doctor.length > 0 ? (
              bed.occupancy.admissionId.doctor.map((history, index) => {
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
            <div className="p-2 w-full md:w-4/5 mx-auto bg-slate-700 my-2 rounded-lg">
              <div
                className="relative py-1 px-2 flex justify-between w-1/2 bg-gray-800 mx-auto rounded-lg"
                onClick={() => {
                  setActiveDropDown(activeDropDown === 2 ? null : 2);
                }}
              >
                <div className="">Add Visiting</div>
                <div className="">{activeDropDown == 2 ? "-" : "+"}</div>
              </div>
              {activeDropDown == 2 && (
                <div className="p-2 w-1/2 mx-auto my-1 bg-slate-600 rounded overflow-y-auto max-h-60">
                  {data.doctors.map((Doctor, index) => (
                    <div
                      className="flex items-center justify-center border-b border-gray-500 gap-3 px-2 font-medium"
                      key={index}
                    >
                      <input
                        type="checkbox"
                        className="size-4 cursor-pointer"
                        checked={selectedDoctorVisiting.includes(Doctor._id)}
                        onChange={() => handleDoctorVisiting(Doctor)}
                      />
                      <div>
                        {Doctor.name} - {Doctor.charge}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedDoctorVisiting.length > 0 && (
                <div className="my-1 text-center font-semibold">
                  Selected Doctors
                </div>
              )}

              {selectedDoctorVisiting.map((DoctorId, index) => {
                const Doctor = data.doctors.find(
                  (doctor) => doctor._id === DoctorId
                );
                return (
                  <div
                    key={index}
                    className="w-1/2 p-1 border-b border-gray-600 mx-auto flex justify-between items-center text-sm"
                  >
                    <div className="w-2/5">{Doctor.name}</div>
                    <div>{Doctor.charge}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div
          className="w-3/4 mx-auto px-6 py-2 cursor-pointer border-b-2 border-gray-800 bg-slate-600 rounded-full hover:bg-gray-800 flex justify-between items-center"
          onClick={() => {
            setActiveAddOns(activeAddOns === 2 ? null : 2);
            setActiveDropDown(null);
          }}
        >
          <h3 className="font-semibold text-lg capitalize">Packages</h3>
          <span className="text-gray-300">
            {activeAddOns === 2 ? "-" : "+"}
          </span>
        </div>
        {activeAddOns === 2 && (
          <div className="bg-slate-800 p-4 w-3/4 mx-auto my-1 rounded-xl">
            {bed.occupancy.admissionId.package.length > 0 ? (
              bed.occupancy.admissionId.package.map((history, index) => {
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
            <div className="p-2 w-full md:w-4/5 mx-auto bg-slate-700 my-2 rounded-lg">
              <div
                className="relative py-1 px-2 flex justify-between w-1/2 bg-gray-800 mx-auto rounded-lg"
                onClick={() => {
                  setActiveDropDown(activeDropDown === 3 ? null : 3);
                }}
              >
                <div className="">Add Packages</div>
                <div className="">{activeDropDown == 3 ? "-" : "+"}</div>
              </div>
              {activeDropDown == 3 && (
                <div className="p-2 w-1/2 mx-auto my-1 bg-slate-600 rounded overflow-y-auto max-h-60">
                  {data.packages.map((Package, index) => (
                    <div
                      className="flex items-center justify-center border-b border-gray-500 gap-3 px-2 font-medium"
                      key={index}
                    >
                      <input
                        type="checkbox"
                        className="size-4 cursor-pointer"
                        checked={selectedPackage.includes(Package._id)}
                        onChange={() => handlePackage(Package)}
                      />
                      <div>
                        {Package.name} - {Package.price}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedPackage.length > 0 && (
                <div className="my-1 text-center">Selected Items</div>
              )}

              {selectedPackage.map((PackageId, index) => {
                const Package = data.packages.find(
                  (Package) => Package._id === PackageId
                );
                return (
                  <div
                    key={index}
                    className="w-1/2 p-1 border-b border-gray-600 mx-auto flex justify-between items-center text-sm"
                  >
                    <div className="w-2/5">{Package.name}</div>
                    <div>{Package.price}</div>
                  </div>
                );
              })}
            </div>
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
          <div className="w-full flex justify-center">
            <textarea
              className="rounded-lg p-3 my-2 w-3/4 mx-auto bg-slate-900 outline outline-gray-600"
              onChange={(e) => {
                setReason(e.target.value);
              }}
            >
              {reason}
            </textarea>
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
                  placeholder="Insurence Provide Name"
                  value={insurenceDeatils.providerName}
                  onChange={handleInsurenceInfo}
                  required
                />
                <input
                  type="text"
                  name="tpa"
                  className="rounded-lg p-3 w-full mx-auto bg-slate-900 outline outline-gray-600"
                  placeholder="TPA"
                  value={insurenceDeatils.tpa}
                  onChange={handleInsurenceInfo}
                />
                <input
                  type="number"
                  min={0}
                  name="coverageAmount"
                  className="rounded-lg p-3 w-full md:w-48 mx-auto bg-slate-900 outline outline-gray-600"
                  placeholder="Coverage Amount"
                  value={insurenceDeatils.coverageAmount}
                  onChange={handleInsurenceInfo}
                  required
                />
              </div>
            </div>
            <div className="text-center text-slate-400">
              *for insurence details Provide name must be required
            </div>
            <div className="bg-slate-800 p-4 w-3/4 mx-auto my-1 rounded-xl">
              <div className="text-center text-lg font-semibold my-1">
                Payments
              </div>

              {bed.occupancy.admissionId.insuranceInfo &&
              bed.occupancy.admissionId.insuranceInfo.payments.length > 0 ? (
                bed.occupancy.admissionId.insuranceInfo.payments.map(
                  (payment, index) => {
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
                  }
                )
              ) : (
                <div className="text-center text-gray-400">No Payments</div>
              )}

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
                <div className="py-2 px-4 bg-slate-800 w-4/5 mx-auto my-2 rounded-xl">
                  <div className="text-center text-lg font-semibold my-1">
                    Bed Change
                  </div>
                  <div className="p-2 w-full md:w-4/5 mx-auto flex justify-center items-center gap-2 bg-slate-700 my-2 rounded-lg">
                    <select
                      className="py-2 px-2 w-1/2 bg-gray-600 rounded-lg text-center"
                      onChange={(e) => {
                        setChangeingBedId(e.target.value);
                        console.log(e.target.value);
                      }}
                    >
                      <option value=""> -- Select Ward & Bed -- </option>
                      {availableBeds.map((nBed, index) => (
                        <option key={index} value={nBed._id}>
                          {nBed.ward} - {nBed.bedName}
                        </option>
                      ))}
                    </select>
                    <button
                      className="bg-red-500 hover:bg-red-700 px-4 py-1 rounded-lg"
                      onClick={handleBedChange}
                    >
                      {submitting ? "Submiting..." : "Submit"}
                    </button>
                  </div>
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

              {bed.occupancy.admissionId.supplementaryService &&
              bed.occupancy.admissionId.supplementaryService.length > 0 ? (
                bed.occupancy.admissionId.supplementaryService.map(
                  (suppService, index) => {
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
                  }
                )
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

              {bed.occupancy.admissionId.otherServices &&
              bed.occupancy.admissionId.otherServices.length > 0 ? (
                bed.occupancy.admissionId.otherServices.map((othSer, index) => {
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

              <div className="p-2 w-full md:w-4/5 mx-auto flex flex-wrap justify-center items-center gap-2 bg-slate-700 my-2 rounded-lg">
                <input
                  type="text"
                  placeholder="Name"
                  name="name"
                  value={othServices.name}
                  onChange={handleOthInfo}
                  className="py-1 px-2 w-2/5 bg-gray-800 rounded-lg"
                  required
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Amount"
                  name="amount"
                  value={othServices.amount}
                  onChange={handleOthInfo}
                  className="py-1 px-2 w-2/5 bg-gray-800 rounded-lg"
                  required
                />
                <button
                  onClick={onOthServiceSubmit}
                  className="bg-red-500 hover:bg-red-700 px-4 py-1 rounded-lg"
                >
                  {submitting ? "Submiting..." : "Submit"}
                </button>
              </div>
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

              {bed.occupancy.admissionId.ipdPayments &&
              bed.occupancy.admissionId.ipdPayments.length > 0 ? (
                bed.occupancy.admissionId.ipdPayments.map((payment, index) => {
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

            {/* <div className="p-2 w-full md:w-4/5 mx-auto flex justify-center items-center gap-2 bg-slate-800 my-2 rounded-lg">
              <button className="bg-red-500 hover:bg-red-700 px-4 py-1 rounded-lg">
                Submit
              </button>
              <button className="bg-red-500 hover:bg-red-700 px-4 py-1 rounded-lg">
                Submit
              </button>
              <button className="bg-red-500 hover:bg-red-700 px-4 py-1 rounded-lg">
                Submit
              </button>
            </div> */}
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
                <div className="py-2 px-4 bg-slate-800 w-4/5 mx-auto my-2 rounded-xl">
                  <div className="text-center text-lg font-semibold my-1">
                    Discharge Patient
                  </div>
                  <div className="p-2 w-full md:w-4/5 mx-auto flex justify-center items-center gap-2 bg-slate-700 my-2 rounded-lg">
                    {insurenceDeatils.providerName ||
                    chargeBalenceDetails.balance <= 0 ? (
                      <button
                        className="bg-red-500 hover:bg-red-700 px-4 py-1 rounded-lg"
                        onClick={() => {
                          setTakeConfirmDischarge(true);
                        }}
                      >
                        {submitting ? "Processing..." : "Confirm"}
                      </button>
                    ) : (
                      <div className="text-center">
                        This patient's dues are not cleared!
                      </div>
                    )}
                  </div>
                </div>
                {takeConfirmDischarge && (
                  <div className="absolute top-0 left-0">
                    <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
                      <div className="w-4/5 md:w-3/4 lg:w-3/5 py-4 text-center bg-slate-950 px-4 rounded-xl">
                        <div className="h-10 w-10 mx-auto my-3 rounded-full bg-red-200 flex justify-center items-center">
                          <PiSealWarningBold className="text-red-500 text-2xl" />
                        </div>
                        <h2 className="font-bold text-2xl text-center">
                          Confirm Discharge
                        </h2>
                        {insurenceDeatils.providerName &&
                          chargeBalenceDetails.balance > 0 && (
                            <div className="text-center w-3/4 mx-auto text-lg font-semibold text-red-500">
                              This patient is under insurance and the
                              outstanding amount has not been paid yet,
                            </div>
                          )}
                        <div className="text-center">
                          Are you sure you want to Discharge this Patient?
                        </div>
                        {message && (
                          <div className="my-1 px-4 text-center text-red-400">
                            {message}
                          </div>
                        )}
                        <hr className="border border-gray-200 w-full my-3" />
                        <div className="flex justify-end gap-2">
                          <button
                            className="px-2 py-1 border-2 border-gray-500 rounded-lg font-semibold cursor-pointer"
                            onClick={() => {
                              setTakeConfirmDischarge(false);
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-2 py-1 bg-green-500 rounded-lg text-white font-semibold cursor-pointer"
                            onClick={handlePatientDischarge}
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
