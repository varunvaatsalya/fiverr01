"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { showError, showSuccess } from "@/app/utils/toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDateToIST } from "../utils/date";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IoReceiptOutline } from "react-icons/io5";
import { FaTruckMedical } from "react-icons/fa6";
import { GrMoney } from "react-icons/gr";
import { ToWords } from "to-words";
import { useStockType } from "../context/StockTypeContext";

export default function PharmacyDueInvoice() {
  const router = useRouter();
  const [selectedSourceId, setSelectedSourceId] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [role, setRole] = useState("");
  const [sharedPaymentInfo, setSharedPaymentInfo] = useState({
    referenceNumber: "",
    date: "",
    mode: "Bank Transfer",
    bankDetails: null,
  });

  const [isValidPaymentEntry, setIsValidPaymentEntry] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const sectionType = useStockType();

  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
      currencyOptions: {
        name: "Rupee",
        plural: "Rupees",
        symbol: "₹",
        fractionalUnit: {
          name: "Paisa",
          plural: "Paise",
          symbol: "",
        },
      },
    },
  });
  // /api/newPurchaseInvoice/dueInvoices/fix
  // /api/medicineMetaData/fix
  async function fetchData() {
    try {
      let result = await fetch(`/api/newPurchaseInvoice/dueInvoices?sectionType=${sectionType}`);
      result = await result.json();
      if (result.success) {
        setInvoices(result.dueInvoices);
        setFilteredInvoices(result.dueInvoices);
        setRole(result.userRole);
      } else {
        showError(result.message);
      }
    } catch (err) {
      console.log("error: ", err);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {}, [isValidPaymentEntry]);

  const handleCheckboxChange = (invoiceId, sourceId) => {
    if (selectedSourceId && selectedSourceId !== sourceId) return;

    const isAlreadySelected = selectedInvoices.some(
      (inv) => inv.invoiceId === invoiceId
    );
    let updatedInvoices = [];

    if (isAlreadySelected) {
      updatedInvoices = selectedInvoices.filter(
        (inv) => inv.invoiceId !== invoiceId
      );
    } else {
      updatedInvoices = [...selectedInvoices, { invoiceId, amount: 0 }];
    }

    if (updatedInvoices.length === 0) {
      setSharedPaymentInfo({
        referenceNumber: "",
        date: "",
        mode: "Bank Transfer",
        bankDetails: null,
      });
    }

    setSelectedInvoices(updatedInvoices);
    setSelectedSourceId(updatedInvoices.length > 0 ? sourceId : null);
  };

  const handleAmountChange = (invoiceId, value) => {
    const amount = parseFloat(value);

    setSelectedInvoices((prev) =>
      prev.map((inv) =>
        inv.invoiceId === invoiceId
          ? { ...inv, amount: isNaN(amount) ? 0 : amount }
          : inv
      )
    );
  };

  const handleSearch = (term) => {
    const lowerTerm = term.toLowerCase();
    const filtered = invoices.filter(
      (group) =>
        group.source?.name.toLowerCase().includes(lowerTerm) ||
        group.invoices.some((inv) =>
          inv.invoiceNumber.toLowerCase().includes(lowerTerm)
        )
    );
    setFilteredInvoices(filtered);
  };

  const onSubmit = async () => {
    setSubmitting(true);
    const url = `/api/newPurchaseInvoice/dueInvoices`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selectedInvoices,
        sharedPaymentInfo,
        sectionType,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        showSuccess(result.message || "Payment submitted successfully");
        setSelectedInvoices([]);
        setSelectedSourceId(null);
        setShowConfirmModal(false);
        setSharedPaymentInfo({
          referenceNumber: "",
          date: "",
          mode: "Bank Transfer",
          bankDetails: null,
        });
        fetchData();
      } else {
        showError(result.message || "Something went wrong");
      }
    } else {
      showError("Something went wrong");
    }
    setSubmitting(false);
  };

  const selectedTotal = selectedInvoices.reduce(
    (acc, inv) => acc + (inv.amount || 0),
    0
  );

  const totalInvoices = invoices.reduce(
    (acc, group) => acc + group.invoices.length,
    0
  );

  const totalDues = invoices.reduce((acc, group) => {
    return (
      acc +
      group.invoices.reduce((sum, invoice) => {
        const paid = invoice.payments.reduce((p, pay) => p + pay.amount, 0);
        return sum + (invoice.grandTotal - paid);
      }, 0)
    );
  }, 0);

  let isAllSelectedInvoiceHasPaymentEntry = selectedInvoices.every(
    (inv) => inv.amount && inv.amount > 0
  );
  return (
    <div className="space-y-3 text-black">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Input
          placeholder="Search by source name..."
          className="w-full sm:w-[250px] bg-gray-50"
          onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="flex flex-wrap gap-4 text-sm text-gray-700 justify-end">
          <div className="px-3 py-1 bg-white rounded flex items-center gap-1">
            <FaTruckMedical className="size-4" />
            <div>
              Total Sources: <strong>{invoices.length}</strong>
            </div>
          </div>
          <div className="px-3 py-1 bg-white rounded flex items-center gap-1">
            <IoReceiptOutline className="size-4" />
            <div>
              Total Invoices: <strong>{totalInvoices}</strong>
            </div>
          </div>
          <div className="px-3 py-1 bg-white rounded flex items-center gap-1">
            <GrMoney className="size-4" />
            <div>
              Total Dues: <strong>₹{parseFloat(totalDues.toFixed())}</strong>
            </div>
          </div>
        </div>
      </div>

      {filteredInvoices.map((group) => {
        const isSourceSelected = selectedInvoices.some((invs) =>
          group.invoices.some((inv) => inv._id === invs.invoiceId)
        );

        return (
          <div
            key={group.source?._id}
            className="border rounded-lg shadow-sm p-3 bg-white"
          >
            <div className="flex justify-between items-center bg-black text-white p-3 rounded">
              <div className="font-semibold">{group.source?.name}</div>
              <div className="space-x-4 text-sm">
                <span>Total: ₹{parseFloat(group.totalAmount.toFixed(2))}</span>
                <span>Paid: ₹{parseFloat(group.paidAmount.toFixed(2))}</span>
                <span>Due: ₹{parseFloat(group.dueAmount.toFixed(2))}</span>
              </div>
            </div>

            {isSourceSelected && (
              <div className="mt-4 mb-2 flex gap-2 items-center bg-gray-50 p-3 rounded-md">
                <Input
                  placeholder="Reference Number"
                  value={sharedPaymentInfo.referenceNumber}
                  onChange={(e) =>
                    setSharedPaymentInfo((prev) => ({
                      ...prev,
                      referenceNumber: e.target.value,
                    }))
                  }
                />
                <Input
                  type="date"
                  value={sharedPaymentInfo.date}
                  onChange={(e) =>
                    setSharedPaymentInfo((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
                <Select
                  value={sharedPaymentInfo.mode}
                  onValueChange={(value) =>
                    setSharedPaymentInfo((prev) => ({
                      ...prev,
                      mode: value,
                      bankDetails: null,
                    }))
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Bank Transfer", "Cash", "UPI", "OTHERS"].map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {sharedPaymentInfo.mode === "Bank Transfer" && (
                  <Select
                    required={Boolean(
                      sharedPaymentInfo.mode === "Bank Transfer"
                    )}
                    value={sharedPaymentInfo.bankDetails}
                    onValueChange={(value) =>
                      setSharedPaymentInfo((prev) => ({
                        ...prev,
                        bankDetails: value,
                      }))
                    }
                  >
                    <SelectTrigger className="min-w-[250px]">
                      <SelectValue placeholder="Select Bank Account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>--Select Bank--</SelectItem>
                      {group.source?.bankDetails?.length > 0 ? (
                        group.source?.bankDetails.map((bank) => (
                          <SelectItem key={bank._id} value={bank}>
                            {`${bank.accountNo} - ${bank.bankName} (${bank.branch})`}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="">No Bank found</div>
                      )}
                      {role && (
                        <button
                          className="text-gray-600 underline text-sm px-2 hover:text-black"
                          onClick={() =>
                            router.push(
                              `/dashboard-${role}/pharmacy/pharmacyConfig/metaData?type=Vendor`
                            )
                          }
                        >
                          Add Bank Details
                        </button>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <div className="mt-2 space-y-2">
              <div className="grid grid-cols-8 font-semibold text-sm text-gray-700 px-2">
                <div>Select</div>
                <div>Invoice No</div>
                <div>Date</div>
                <div>{"Stock(s)"}</div>
                <div>Grand Total</div>
                <div className="text-right">Paid</div>
                <div className="text-right">Remaining</div>
                <div className="text-right">Payment</div>
              </div>

              {group.invoices.map((invoice) => {
                const selected = selectedInvoices.some(
                  (inv) => inv.invoiceId === invoice._id
                );
                const currentAmount =
                  selectedInvoices.find((inv) => inv.invoiceId === invoice._id)
                    ?.amount || "";
                const totalPaid = invoice.payments.reduce(
                  (acc, p) => acc + p.amount,
                  0
                );

                return (
                  <div
                    key={invoice._id}
                    className={cn(
                      "grid grid-cols-8 items-center gap-2 border rounded p-1.5",
                      selected && "bg-gray-100"
                    )}
                  >
                    {/* Select */}
                    <div>
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() =>
                          handleCheckboxChange(invoice._id, group.source?._id)
                        }
                      />
                    </div>

                    {/* Invoice Number */}
                    <div className="truncate">{invoice.invoiceNumber}</div>

                    {/* Invoice Date */}
                    <div>{formatDateToIST(invoice.invoiceDate)}</div>

                    {/* Stock Count + Modal Trigger */}
                    <div>
                      <button
                        className="underline text-blue-600"
                        onClick={() =>
                          console.log("Show stock modal", invoice.stocks)
                        }
                      >
                        {invoice.stocks.length} stock(s)
                      </button>
                    </div>

                    {/* Grand Total */}
                    <div>₹{parseFloat(invoice?.grandTotal?.toFixed(2))}</div>

                    {/* Paid Info */}
                    <div className="text-right">
                      ₹{parseFloat(totalPaid.toFixed(2)) || 0}
                    </div>
                    <div className="text-right text-red-500">
                      ₹{parseFloat(invoice.grandTotal - totalPaid).toFixed(2)}
                    </div>

                    {/* Payment Input Column */}
                    <div className="flex items-center justify-end">
                      {selected ? (
                        <Input
                          type="number"
                          placeholder="Amount"
                          className="w-[120px] h-8 bg-white"
                          value={currentAmount}
                          onChange={(e) => {
                            const newAmount = parseFloat(e.target.value);
                            handleAmountChange(invoice._id, newAmount);

                            if (newAmount > invoice.grandTotal - totalPaid) {
                              setIsValidPaymentEntry(false);
                            } else {
                              setIsValidPaymentEntry(true);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {isSourceSelected && (
              <div className="mt-4 flex justify-between items-center flex-wrap gap-2">
                <Button
                  disabled={
                    !sharedPaymentInfo.referenceNumber ||
                    !sharedPaymentInfo.date ||
                    !sharedPaymentInfo.mode ||
                    (sharedPaymentInfo.mode === "Bank Transfer" &&
                      !sharedPaymentInfo.bankDetails) ||
                    selectedTotal <= 0 ||
                    !isValidPaymentEntry ||
                    !isAllSelectedInvoiceHasPaymentEntry ||
                    submitting
                  }
                  onClick={() => setShowConfirmModal(true)}
                >
                  Submit Payment
                </Button>
                {!isValidPaymentEntry && (
                  <div className="text-red-500 font-semibold text-sm">
                    The Amount to be paid should not be more than due amount.
                  </div>
                )}
                <div className="text-right font-medium">
                  <div>Total Paying: ₹{selectedTotal}</div>
                  {selectedTotal > 0 && (
                    <div className="text-xs text-gray-500 italic">
                      {toWords.convert(selectedTotal)}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
              <DialogContent className="text-black">
                <DialogHeader>
                  <DialogTitle>Confirm Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 text-sm text-gray-700">
                  <div>
                    <strong>Reference No:</strong>{" "}
                    {sharedPaymentInfo.referenceNumber}
                  </div>
                  <div>
                    <strong>Date:</strong> {sharedPaymentInfo.date}
                  </div>
                  <div>
                    <strong>Mode:</strong> {sharedPaymentInfo.mode}
                  </div>
                  {sharedPaymentInfo.mode === "Bank Transfer" && (
                    <div>
                      <strong>BankDetails:</strong>{" "}
                      {sharedPaymentInfo?.bankDetails?.accountHolderName
                        ? `${sharedPaymentInfo?.bankDetails?.accountHolderName} - ${sharedPaymentInfo?.bankDetails?.bankName} (${sharedPaymentInfo?.bankDetails?.branch})`
                        : `${sharedPaymentInfo?.bankDetails?.bankName} - ${sharedPaymentInfo?.bankDetails?.accountNo} (${sharedPaymentInfo?.bankDetails?.branch})`}
                    </div>
                  )}
                  <div>
                    <strong>Invoices:</strong> {selectedInvoices.length}
                  </div>
                  <div>
                    <strong>Total:</strong> ₹{selectedTotal}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  {!submitting && (
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmModal(false)}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={onSubmit}
                    disabled={selectedTotal <= 0 || submitting}
                  >
                    {submitting ? "Submitting..." : "Confirm"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );
      })}
    </div>
  );
}
