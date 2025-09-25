"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ArrowLeft, ArrowRight, FileImage, Info } from "lucide-react";
import { showError, showInfo, showSuccess } from "@/app/utils/toast";
import { FaArrowRotateRight } from "react-icons/fa6";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { formatDateToIST } from "@/app/utils/date";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

function PurchaseInvoiceVerification() {
  const rotationSteps = [0, 90, 180, -90];
  const [rotate, setRotate] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [rejectedInvoiceCount, setRejectedInvoiceCount] = useState(0);
  const [editingInvoiceCount, setEditingInvoiceCount] = useState(0);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const invoice = pendingInvoices[currentIndex] ?? null;
  console.log(invoice);

  const rotateClass = {
    0: "rotate-0",
    90: "rotate-90",
    180: "rotate-180",
    [-90]: "-rotate-90",
  }[rotate];

  const processedStocks = useMemo(() => {
    if (!invoice) return [];

    return invoice.stocks.map((item) => {
      const packetSize = item.medicine?.packetSize;
      const quantity = item.initialQuantity || 0;
      const offer = item.offer || 0;
      const purchasePrice = item.purchasePrice || 0;
      const discount = item.discount || 0;
      const sgst = item.sgst || 0;
      const cgst = item.cgst || 0;

      let baseAmount = quantity * purchasePrice;

      // Discount calculation
      let discountAmount = baseAmount * (discount / 100);
      let discountedAmount = baseAmount - discountAmount;

      // GST calculation
      let totalGSTPercent = sgst + cgst;
      let gstAmount = discountedAmount * (totalGSTPercent / 100);

      // Final amount paid to vendor
      let filedTotalAmount = discountedAmount + gstAmount;

      // Net Purchase Rate (quantity + offer)
      let totalUnitsReceived = quantity + offer;
      let netPurchaseRate =
        totalUnitsReceived > 0
          ? parseFloat((filedTotalAmount / totalUnitsReceived).toFixed(2))
          : 0;

      let costPrice = quantity > 0 ? filedTotalAmount / quantity : 0;

      let totalAmount = parseFloat((costPrice * quantity).toFixed(2));

      return {
        ...item,
        quantity,
        packetSize,
        costPrice,
        netPurchaseRate,
        totalAmount,
      };
    });
  }, [invoice]);

  const grandTotal = useMemo(() => {
    return processedStocks.reduce((sum, s) => sum + s.totalAmount, 0);
  }, [processedStocks]);

  useEffect(() => {
    async function fetchData() {
      try {
        let res = await fetch("/api/newPurchaseInvoice?pendingInvoices=1");
        res = await res.json();
        if (res.success) {
          setPendingInvoices(res.pendingInvoices || []);
          setRejectedInvoiceCount(res.rejectedCount || 0);
          setEditingInvoiceCount(res.editingCount || 0);
        } else showError(res.message || "Failed to fetch invoices");
      } catch (error) {
        console.error("Failed to fetch pending invoices:", error);
        showError("Failed to fetch pending invoices");
      }
    }
    fetchData();
  }, []);

  const handleInvoiceAction = async (status) => {
    if (status === "rejected" && !rejectionReason) {
      showError("Please select a rejection reason.");
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch("/api/newStock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pendingInvoiceId: invoice._id,
          status,
          rejectionReason: status === "rejected" ? rejectionReason : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        status === "approved"
          ? showSuccess(`Invoice ${invoice.invoiceNumber} approved.`)
          : showInfo(`Invoice ${invoice.invoiceNumber} rejected.`);

        handleRemoveInvoice();
        setRejectionReason("");
        setShowRejectDialog(false);
      } else {
        showError(data.message || `${status} failed.`);
      }
    } catch (err) {
      showError(`Something went wrong during ${status}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveInvoice = () => {
    setPendingInvoices((prev) => {
      const updated = [...prev];
      updated.splice(currentIndex, 1);

      // Adjust index safely
      if (currentIndex >= updated.length && updated.length > 0) {
        setCurrentIndex(updated.length - 1); // move to previous item if at end
        setCurrentImgIndex(0);
      }

      return updated;
    });
  };

  const handleSendForEdit = async () => {
    setSubmitting(true);

    try {
      const res = await fetch("/api/newStock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pendingInvoiceId: invoice._id,
          status: "editing",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showInfo(
          data.message || `Invoice ${invoice.invoiceNumber} is send for edit.`
        );
        handleRemoveInvoice();
      } else {
        showError(data.message || `forwarding failed.`);
      }
    } catch (err) {
      showError(`Something went wrong during sending invoice for edit.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    setCurrentImgIndex(0);
  };

  const handleNext = () => {
    if (currentIndex < pendingInvoices.length - 1)
      setCurrentIndex((i) => i + 1);
    setCurrentImgIndex(0);
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    },
    [currentIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div>
      <div className="flex justify-center gap-2">
        {rejectedInvoiceCount > 0 && (
          <div className="font-semibold text-center text-red-500">{`(${rejectedInvoiceCount} Rejected Invoice)`}</div>
        )}
        {editingInvoiceCount > 0 && (
          <div className="font-semibold text-center text-blue-500">{`(${editingInvoiceCount} Invoice is sent for Editing)`}</div>
        )}
      </div>
      {!invoice ? (
        <div className="text-center text-red-600 text-lg p-4">
          No Pending Invoice
        </div>
      ) : (
        <div className="p-2 w-full flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-center text-black">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="text-lg font-semibold">
              Pending Invoice {currentIndex + 1} of {pendingInvoices.length}{" "}
            </div>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === pendingInvoices.length - 1}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Left - Bill Image */}
            <Card className="flex items-center justify-center overflow-hidden h-full relative">
              {invoice?.billImageIds && invoice.billImageIds.length > 0 ? (
                <div className="w-3/4 aspect-square">
                  <Image
                    src={`/api${invoice.billImageIds[currentImgIndex].filepath}`}
                    alt="Bill Image"
                    width={600}
                    height={800}
                    className={`object-contain w-full h-full transition-transform duration-300 ${rotateClass}`}
                  />
                  <div className="absolute right-2 top-2 flex flex-col gap-2">
                    {/* Rotate */}
                    <Button
                      variant="outline"
                      className="text-black opacity-30 hover:opacity-90"
                      onClick={() => {
                        const current = rotationSteps.indexOf(rotate);
                        const next = (current + 1) % rotationSteps.length;
                        setRotate(rotationSteps[next]);
                      }}
                    >
                      <FaArrowRotateRight className="size-5" />
                    </Button>

                    {/* Prev */}
                    <Button
                      variant="outline"
                      className="text-black opacity-30 hover:opacity-90"
                      onClick={() => {
                        setCurrentImgIndex((prev) =>
                          prev > 0 ? prev - 1 : invoice.billImageIds.length - 1
                        );
                      }}
                    >
                      <FaArrowLeft className="size-5" />
                    </Button>

                    {/* Next */}
                    <Button
                      variant="outline"
                      className="text-black opacity-30 hover:opacity-90"
                      onClick={() => {
                        setCurrentImgIndex(
                          (prev) => (prev + 1) % invoice.billImageIds.length
                        );
                      }}
                    >
                      <FaArrowRight className="size-5" />
                    </Button>
                    <div
                      className="bg-white shadow-md rounded-lg border border-muted opacity-40 hover:opacity-80 text-center font-semibold"
                      variant="secondary"
                    >
                      {`${currentImgIndex + 1}/${invoice.billImageIds.length}`}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <FileImage className="w-16 h-16" />
                  <p className="mt-2">Bill image not uploaded</p>
                </div>
              )}
            </Card>

            {/* Right - Invoice Details */}
            <Card className="overflow-auto">
              <CardContent className="p-4 space-y-4">
                <div className="text-xl font-bold">
                  Invoice #{invoice.invoiceNumber}
                </div>
                <div className="grid grid-cols-2 gap-0.5 text-sm">
                  <span className="text-muted-foreground">
                    Vendor Inovice ID:
                  </span>
                  <span>{invoice.vendorInvoiceId}</span>
                  <span className="text-muted-foreground">From:</span>
                  <span>{invoice.source?.name || "N/A"}</span>
                  <span className="text-muted-foreground">Invoice Date:</span>
                  <span className="uppercase">
                    {formatDateToIST(invoice.invoiceDate)}
                  </span>
                  <span className="text-muted-foreground">Received Date:</span>
                  <span className="uppercase">
                    {formatDateToIST(invoice.receivedDate)}
                  </span>

                  <span className="text-muted-foreground">From:</span>
                  <span>
                    <Badge
                      className={
                        "uppercase text-white " +
                        (invoice.sectionType !== "hospital"
                          ? "bg-green-600"
                          : "bg-blue-500")
                      }
                    >
                      {invoice.sectionType}
                    </Badge>
                  </span>
                  <span className="text-muted-foreground">Backdated:</span>
                  <span>
                    <Badge
                      variant={
                        invoice.isBackDated ? "destructive" : "secondary"
                      }
                      className={invoice.isBackDated ? "animate-pulse" : ""}
                    >
                      {invoice.isBackDated ? "Yes" : "No"}
                    </Badge>
                  </span>
                </div>

                <hr />

                <div className="text-md font-semibold">Stock Summary</div>
                <div className="max-h-[30vh] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th>Sr.</th>
                        <th>Medicine</th>
                        <th>Qty(U)</th>
                        <th>Avl Qty(U)</th>
                        <th>Cost Rate</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedStocks.map((stock, idx) => (
                        <tr key={idx} className="border-b">
                          <td>{idx + 1 + "."}</td>
                          <td>{stock.medicine.name}</td>
                          <td>{`${stock.quantity}+${stock.offer}`}</td>
                          <td>{stock.currentQuantity}</td>
                          <td className="flex items-center gap-2">
                            {`₹${parseFloat(stock.costPrice?.toFixed(2))}`}
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Info className="size-4" />
                              </HoverCardTrigger>
                              <HoverCardContent className="text-xs w-64">
                                <div>
                                  <b>Batch:</b> {stock.batchName}
                                </div>
                                <div>
                                  <b>Expiry:</b>{" "}
                                  {formatDateToIST(stock.expiryDate)}
                                </div>
                                <div>
                                  <b>Packet Size:</b>{" "}
                                  {stock.packetSize?.strips || 0} Qty/Boxes{" "}
                                  {stock.isTablets
                                    ? `, ${
                                        packetSize?.tabletsPerStrip || 1
                                      } Tablets/Strip`
                                    : ""}
                                </div>
                                <div>
                                  <b>Quantity:</b> {stock.quantity}
                                </div>
                                <div>
                                  <b>MRP:</b> ₹{stock.sellingPrice.toFixed(2)}
                                </div>
                                <div>
                                  <b>Initial Purchase Rate:</b> ₹
                                  {stock.purchasePrice.toFixed(2)}
                                </div>
                                <div>
                                  <b>Discount:</b> {stock.discount || 0}%
                                </div>
                                <div>
                                  <b>GST:</b> ({stock.sgst}% + {stock.cgst}%)
                                </div>
                                <div>
                                  <b>Cost Price:</b> ₹
                                  {stock.costPrice.toFixed(2)}
                                </div>
                                <div>
                                  <b>Offer:</b> ₹{stock.offer || "-"}
                                </div>
                                <div>
                                  <b>Net Rate:</b> ₹
                                  {stock.netPurchaseRate.toFixed(2)}
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </td>
                          <td>{stock.totalAmount + "/-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-right font-semibold text-md">
                  Grand Total: ₹{grandTotal.toFixed(2)}
                </div>

                <div className="flex justify-between gap-4">
                  <Button variant="outline" onClick={handleSendForEdit}>
                    Send for Edit
                  </Button>
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="destructive"
                      onClick={() => setShowRejectDialog(true)}
                    >
                      Reject
                    </Button>
                    <Button
                      disabled={submitting}
                      onClick={() => handleInvoiceAction("approved")}
                    >
                      {submitting ? "Processing..." : "Approve"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogContent className="text-black">
                <DialogHeader>
                  <DialogTitle>Reject Invoice</DialogTitle>
                  <DialogDescription>
                    Select a reason for rejecting this invoice.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                  <Label htmlFor="reason">Rejection Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Write the reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowRejectDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={!rejectionReason || submitting}
                    onClick={() => handleInvoiceAction("rejected")}
                  >
                    {submitting ? "Processing..." : "Reject"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseInvoiceVerification;
