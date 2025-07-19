import React from "react";
import { formatDateTimeToIST, formatDateToIST } from "../utils/date";
import { PharmacyDetails } from "../HospitalDeatils";

function IpdInvoice({printInvoice, setPrintInvoice}) {
  // Do same for others
  console.log(printInvoice);

  const getTotalBedCharges = (bedHistory = []) => {
  return bedHistory.reduce((sum, b) => {
    const start = new Date(b.startDate);
    const end = new Date(b.endDate || new Date());
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const rate = b.bed?.rate || 0;
    return sum + days * rate;
  }, 0);
};
const getTotalDoctorCharges = (doctor = []) => {
  return doctor.reduce((sum, d) => {
    const charge = d.doctor?.visitCharge || 0;
    return sum + charge;
  }, 0);
};
const getTotalSurgeryCharges = (surgery = []) => {
  return surgery.reduce((sum, s) => {
    const charge = s.surgery?.charge || 0;
    return sum + charge;
  }, 0);
};
const getTotalPackageCharges = (packages = []) => {
  return packages.reduce((sum, p) => {
    const charge = p.package?.rate || 0;
    return sum + charge;
  }, 0);
};
const getTotalSupplementary = (services = []) => {
  return services.reduce((sum, s) => sum + (s.amount || 0), 0);
};
const getTotalOtherServices = (services = []) => {
  return services.reduce((sum, s) => sum + (s.amount || 0), 0);
};
const getTotalInsurancePaid = (insuranceInfo) => {
  return (insuranceInfo?.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
};
const getTotalManualPaid = (payments = []) => {
  return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
};
const totalCharges =
  getTotalBedCharges(printInvoice.bedHistory) +
  getTotalDoctorCharges(printInvoice.doctor) +
  getTotalSurgeryCharges(printInvoice.surgery) +
  getTotalPackageCharges(printInvoice.package) +
  getTotalSupplementary(printInvoice.supplementaryService) +
  getTotalOtherServices(printInvoice.otherServices);

const insurancePaid = getTotalInsurancePaid(printInvoice.insuranceInfo);
const manualPaid = getTotalManualPaid(printInvoice.ipdPayments);

const netPayable = totalCharges - (insurancePaid + manualPaid);

  return (
    <div
      id="invoice"
      className="invoice-printing bg-white text-black flex flex-col items-center"
    >
      <div
        id="invoice"
        className="max-w-4xl w-full min-h-[90vh] bg-white shadow-md p-6 flex flex-col justify-start"
      >
        <div className="print-btn">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => {
                // prescriptionPrinted(printInvoice._id);
                window.print();
              }}
              className="bg-blue-600 hover:bg-blue-500 rounded px-6 py-2 my-2 font-semibold text-base text-white"
            >
              Print
            </button>
            <button
              onClick={() => {
                setPrintInvoice(null);
              }}
              className="bg-red-600 hover:bg-red-500 rounded px-4 py-2 my-2 font-semibold text-base text-white"
            >
              Cancel
            </button>
          </div>
          <div className="text-red-500 text-center">
            * Invoice will not be editable after clicking the print button.
          </div>
        </div>
        <div className="relative ">
          <div className="absolute w-full text-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-4xl font-semibold text-gray-400/[0.3] -z-1">
            {PharmacyDetails?.name}
          </div>
          <div className={"mb-6 text-center"}>
            <h1 className="text-xl font-bold uppercase">
              {PharmacyDetails?.name}
            </h1>
            <p className={"text-[10px]"}>
              {PharmacyDetails?.address} | Phone: {PharmacyDetails?.phone}
            </p>
            <p className={"text-[10px]"}>
              Email: {PharmacyDetails?.email}{" "}
              {PharmacyDetails.website
                ? `| Website: ${PharmacyDetails.website}`
                : ""}
            </p>
            <p className={"text-[10px]"}>
              D.L.No.: {PharmacyDetails?.dlNumber}{" "}
              {PharmacyDetails.gst ? `| GST No.: ${PharmacyDetails.gst}` : ""}
            </p>
          </div>
          <hr className="my-2" />

          <div className={"flex justify-around mb-4 text-xs"}>
            <div>
              <h2 className="text-base font-semibold mb-2">Patient Details</h2>
              <p>
                <strong>Name: </strong>
                <span className="uppercase">{printInvoice.patientId.name}</span>
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
              <h2 className={"text-base font-semibold mb-2"}>Invoice Info</h2>
              <p>
                <strong>Invoice ID:</strong> {printInvoice.adid}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                <span className="uppercase">
                  {formatDateTimeToIST(printInvoice.createdAt)}
                </span>
              </p>
            </div>
          </div>
          <h2 className="text-base font-semibold mt-4">Bed Charges</h2>
          <table className="w-full text-xs mb-2">
            <thead>
              <tr className="border-b">
                <th className="text-left">Bed</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {printInvoice.bedHistory?.map((b, i) => {
                const start = new Date(b.startDate);
                const end = new Date(b.endDate || new Date());
                const days = Math.max(
                  1,
                  Math.ceil((end - start) / (1000 * 60 * 60 * 12))
                );
                const rate = b.bed?.rate || 0;
                const amount = rate * days;

                return (
                  <tr key={i}>
                    <td>{b.bed?.name}</td>
                    <td>{formatDateToIST(b.startDate)}</td>
                    <td>
                      {b.endDate ? formatDateToIST(b.endDate) : "Ongoing"}
                    </td>
                    <td>{days}</td>
                    <td className="text-right">{amount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <h2 className="text-base font-semibold mt-4">Doctor Visits</h2>
          <table className="w-full text-xs mb-2">
            <thead>
              <tr className="border-b">
                <th>Doctor</th>
                <th>Date</th>
                <th className="text-right">Charge</th>
              </tr>
            </thead>
            <tbody>
              {printInvoice.doctor?.map((d, i) => (
                <tr key={i}>
                  <td>{d.doctor?.name}</td>
                  <td>{formatDateToIST(d.visitingDate)}</td>
                  <td className="text-right">{d.doctor?.visitCharge}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="text-base font-semibold mt-4">Surgeries</h2>
          <table className="w-full text-xs mb-2">
            <thead>
              <tr className="border-b">
                <th>Surgery</th>
                <th>Date</th>
                <th className="text-right">Charge</th>
              </tr>
            </thead>
            <tbody>
              {printInvoice.surgery?.map((s, i) => (
                <tr key={i}>
                  <td>{s.surgery?.name}</td>
                  <td>{formatDateToIST(s.date)}</td>
                  <td className="text-right">{s.surgery?.charge}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="text-base font-semibold mt-4">Packages</h2>
          <table className="w-full text-xs mb-2">
            <thead>
              <tr className="border-b">
                <th>Package</th>
                <th>Date</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {printInvoice.package?.map((p, i) => (
                <tr key={i}>
                  <td>{p.package?.name}</td>
                  <td>{formatDateToIST(p.date)}</td>
                  <td className="text-right">{p.package?.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="text-base font-semibold mt-4">
            Supplementary Services
          </h2>
          <table className="w-full text-xs mb-2">
            <thead>
              <tr className="border-b">
                <th>Service</th>
                <th>Date</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {printInvoice.supplementaryService?.map((s, i) => (
                <tr key={i}>
                  <td>{s.name}</td>
                  <td>{formatDateToIST(s.date)}</td>
                  <td className="text-right">{s.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="text-base font-semibold mt-4">Other Services</h2>
          <table className="w-full text-xs mb-2">
            <thead>
              <tr className="border-b">
                <th>Service</th>
                <th>Date</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {printInvoice.otherServices?.map((s, i) => (
                <tr key={i}>
                  <td>{s.name}</td>
                  <td>{formatDateToIST(s.date)}</td>
                  <td className="text-right">{s.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="text-base font-semibold mt-4">Insurance</h2>
          <p>
            <strong>Provider:</strong>{" "}
            {printInvoice.insuranceInfo?.providerName}
          </p>
          <p>
            <strong>TPA:</strong> {printInvoice.insuranceInfo?.tpa}
          </p>
          <p>
            <strong>Coverage:</strong> ₹
            {printInvoice.insuranceInfo?.coverageAmount}
          </p>

          <h3 className="text-sm mt-2 font-medium">Payments from Insurance</h3>
          <table className="w-full text-xs mb-2">
            <thead>
              <tr className="border-b">
                <th>TXN</th>
                <th>Bank</th>
                <th>Date</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {printInvoice.insuranceInfo?.payments?.map((p, i) => (
                <tr key={i}>
                  <td>{p.txno}</td>
                  <td>{p.bankName}</td>
                  <td>{formatDateToIST(p.date)}</td>
                  <td className="text-right">{p.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="text-base font-semibold mt-4">Manual Payments</h2>
          <table className="w-full text-xs mb-2">
            <thead>
              <tr className="border-b">
                <th>Type</th>
                <th>Date</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {printInvoice.ipdPayments?.map((p, i) => (
                <tr key={i}>
                  <td>{p.name}</td>
                  <td>{formatDateToIST(p.date)}</td>
                  <td className="text-right">{p.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="text-base font-semibold mt-4">Total Summary</h2>
          <ul className="text-sm">
            <li>Total Charges: ₹{totalCharges}</li>
            <li>Total Insurance Paid: ₹{insurancePaid}</li>
            <li>Manual Paid: ₹{manualPaid}</li>
            <li>Net Payable: ₹{totalCharges - (insurancePaid + manualPaid)}</li>
          </ul>
          <div className="text-xs text-center mt-8">
            <p>** This is a system-generated invoice. **</p>
            <p className="mt-4">Signature & Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IpdInvoice;
