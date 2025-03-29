import React, { useState } from "react";
import Loading from "./Loading";

function EditPharmacyInvoice({
  editInvoice,
  setEditInvoice,
  setNewInvoiceSection,
  setInvoices,
}) {
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedPaymentMode, setSelectedPaymentMode] = useState(
    editInvoice.paymentMode || ""
  );
  
  async function handleConfirm() {
    setSubmitting(true);
    setMessage(null);
    if (!selectedPaymentMode) {
      setMessage("Please select a payment mode.");
      setSubmitting(false);
      return;
    }
    try {
      const response = await fetch("/api/newPharmacyInvoice", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editInvoice._id,
          paymentMode: selectedPaymentMode,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setInvoices((prevInvoices) =>
          prevInvoices.map((invoice) =>
            invoice._id === editInvoice._id ? { ...invoice, ...data.invoice } : invoice
          )
        );
        setMessage("Invoice updated successfully.");
      } else {
        setMessage(data.message || "Failed to update invoice.");
      }
    } catch (error) {
      setMessage("An error occurred while updating the invoice.");
    } finally {
      setSubmitting(false);
    }
    setEditInvoice(null);
    setNewInvoiceSection((newInvoiceSection) => !newInvoiceSection);
  }
  return (
    <div className="w-[95%] md:w-4/5 text-center border border-slate-900 rounded-xl mx-auto my-2 pb-2">
      <div className="text-center py-2 rounded-t-lg bg-slate-900 text-xl text-white font-semibold">
        Edit Invoice
      </div>
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}
      <div className="p-2">
        {
          <div className="flex flex-wrap justify-around text-white">
            <div className="font-semibold">
              Pateint:{" "}
              <span className="text-blue-500 uppercase">
                {editInvoice.patientId?.name}
              </span>
            </div>
            <div className="font-semibold">
              UHID:{" "}
              <span className="text-blue-500 uppercase">
                {editInvoice.patientId?.uhid}
              </span>
            </div>
          </div>
        }
      </div>
      <div className="p-2">
        <select
          id="paymentMode"
          value={selectedPaymentMode}
          onChange={(e) => {
            setSelectedPaymentMode(e.target.value);
          }}
          className="mt-1 mb-4 block px-4 py-3 text-white md:w-3/4 mx-auto bg-gray-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 transition duration-150 ease-in-out"
        >
          <option value="">-- Payment Mode --</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Card">Card</option>
          <option value="Credit-Insurance">{"Credit (Insurance)"}</option>
          <option value="Credit-Doctor">{"Credit (Doctor)"}</option>
          {/*!ipdPrice && <option value="Insurence">Insurence Patient</option>*/}
        </select>
      </div>
      <hr className="border-t border-slate-900 w-full my-2" />
      <div className="flex px-4 gap-3 justify-end">
        <div
          className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
          onClick={() => {
            setEditInvoice(null);
            setNewInvoiceSection((newInvoiceSection) => !newInvoiceSection);
          }}
        >
          Cancel
        </div>
        <button
          onClick={handleConfirm}
          className={
            "w-20 h-8 py-1 flex items-center justify-center gap-2 rounded-lg font-semibold text-white " +
            (selectedPaymentMode ? "bg-green-500" : "bg-gray-500")
          }
          disabled={!selectedPaymentMode || submitting}
        >
          {submitting ? <Loading size={15} /> : <></>}
          {submitting ? "Wait..." : "Proceed"}
        </button>
      </div>
    </div>
  );
}

export default EditPharmacyInvoice;
