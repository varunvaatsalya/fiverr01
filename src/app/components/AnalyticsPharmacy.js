"use client";
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Loading from "./Loading";
import { showError } from "../utils/toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AnalyticsPharmacy = () => {
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [pharmacyInvoices, setPharmacyInvoices] = useState([]);
  const [returnSummary, setReturnSummary] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [invoiceType, setInvoiceType] = useState("Today");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");

  useEffect(() => {
    async function fetchPharmacyInvoices() {
      try {
        let result = await fetch("/api/analyticsPharmacy");
        result = await result.json();
        if (result.success) {
          setPharmacyInvoices(result.pharmacyInvoices);
          setReturnSummary(result.returnSummary);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchPharmacyInvoices();
  }, []);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      let result = await fetch("/api/analyticsPharmacy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startDateTime, endDateTime }),
      });

      result = await result.json();
      if (result.success) {
        setPharmacyInvoices(result.pharmacyInvoices);
        setReturnSummary(result.returnSummary);
        setInvoiceType("Search");
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilter = () => {
    let filtered = pharmacyInvoices;

    if (selectedPaymentMode) {
      filtered = filtered.filter((p) => p.paymentMode === selectedPaymentMode);
    }
    setFilteredPrescriptions(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [pharmacyInvoices, selectedPaymentMode]);

  const totalDetails = () => {
    let totalCount = 0;
    let totalAmount = 0;
    let subtotalAmount = 0;
    let discountAmount = 0;
    let undeliveredAmount = 0;
    let undeliveredCount = 0;
    let discountCount = 0;

    // Process the invoices
    filteredPrescriptions.forEach((invoice) => {
      if (invoice.paymentMode.startsWith("Credit")) return;
      // Summing total, subtotal, and discount
      totalCount++;
      totalAmount += invoice.price.total || 0;
      subtotalAmount += invoice.price.subtotal || 0;
      discountAmount += invoice.price.subtotal - invoice.price.total || 0;

      // Counting undelivered invoices and summing their amount
      if (!invoice.isDelivered) {
        undeliveredAmount += invoice.price.total || 0;
        undeliveredCount++;
      }

      // Counting invoices with discount
      if (invoice.price.discount > 0) {
        discountCount++;
      }
    });

    return {
      totalCount,
      totalAmount,
      subtotalAmount,
      discountAmount,
      undeliveredAmount,
      undeliveredCount,
      discountCount,
    };
  };

  const paymentSummary = () => {
    const summary = {}; // Dynamic summary object

    filteredPrescriptions.forEach((p) => {
      const mode = p.paymentMode.toLowerCase(); // Ensure case consistency
      const amount = p.price.total;

      if (mode === "mixed" && Array.isArray(p.payments)) {
        p.payments.forEach((subPayment) => {
          const subMode = subPayment.type.toLowerCase();
          const subAmount = subPayment.amount;
          if (!subAmount || subAmount === 0) return;

          if (!summary[subMode]) {
            summary[subMode] = { count: 0, total: 0 };
          }

          summary[subMode].count += 1;
          summary[subMode].total += subAmount;
        });
      }

      if (!summary[mode]) {
        summary[mode] = { count: 0, total: 0 }; // Create if mode not exists
      }

      summary[mode].count += 1;
      summary[mode].total += amount;
    });

    return summary;
  };

  const totalsData = totalDetails();
  const paymentData = paymentSummary();
  // const salesmanData = salesmanSummary();

  if (!pharmacyInvoices) {
    return (
      <div className="min-h-screen bg-slate-900 w-full flex flex-col justify-center items-center">
        <Loading size={50} />
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen flex flex-col items-center">
      <div className="w-full">
        <Navbar route={["Pharmacy", "Analytics"]} />
      </div>

      <div className="w-full flex flex-wrap justify-center items-center gap-3 my-4">
        <div className="flex flex-col md:flex-row min-w-40 gap-2 items-center bg-zinc-800 p-3 rounded-xl shadow">
          <Label
            htmlFor="sdate"
            className="text-blue-300 text-sm font-medium text-nowrap"
          >
            Start Date
          </Label>
          <Input
            id="sdate"
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            className="bg-zinc-900 text-white border border-zinc-700"
          />
        </div>

        <div className="flex flex-col md:flex-row min-w-40 gap-2 items-center bg-zinc-800 p-3 rounded-xl shadow">
          <Label
            htmlFor="edate"
            className="text-blue-300 text-sm font-medium text-nowrap"
          >
            End Date
          </Label>
          <Input
            id="edate"
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
            className="bg-zinc-900 text-white border border-zinc-700"
          />
        </div>

        <Button
          onClick={onSubmit}
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          {submitting ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Filters */}
      <div className="w-full flex flex-wrap items-center justify-center gap-4 bg-zinc-900 p-4 rounded-xl text-white mb-4">
        {/* Uncomment if salesman filter needed */}
        {/* <Select onValueChange={setSelectedSalesman}>
          <SelectTrigger className="w-[200px] bg-zinc-800 text-white border border-zinc-700">
            <SelectValue placeholder="Select Salesman" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
            {salesmen.map((sales) => (
              <SelectItem key={sales._id} value={sales._id}>
                {sales.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}

        <Select
          onValueChange={setSelectedPaymentMode}
          defaultValue={selectedPaymentMode}
        >
          <SelectTrigger className="w-[200px] bg-zinc-800 text-white border border-zinc-700">
            <SelectValue placeholder="Select Payment Mode" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 text-white">
            <SelectItem value="Card">Card</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice Type Display */}
      <div className="font-bold text-lg text-center text-slate-300 bg-zinc-800 rounded-lg py-2 px-4">
        {invoiceType}
      </div>
      <div className="w-full max-w-3xl mx-auto space-y-4 text-white p-2">
        {/* Invoice Totals */}
        <Card className="bg-zinc-900 border border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">
              Invoice Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-white">
            <div className="grid sm:grid-cols-2 gap-4 text-center">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">No. of Invoices</p>
                <p className="text-2xl font-bold">{totalsData.totalCount}</p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">
                  ₹{parseFloat(totalsData.totalAmount.toFixed(2))}/-
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Discount Invoices
                </p>
                <p className="text-xl font-semibold">
                  {totalsData.discountCount}
                </p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Total Discount Amount
                </p>
                <p className="text-xl font-semibold">
                  ₹{parseFloat(totalsData.discountAmount.toFixed(2))}
                </p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Sub Total</p>
                <p className="text-xl font-semibold">
                  ₹{parseFloat(totalsData.subtotalAmount.toFixed(2))}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-center">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Undelivered Invoices
                </p>
                <p className="text-xl font-semibold">
                  {totalsData.undeliveredCount}
                </p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Undelivered Invoice Amount
                </p>
                <p className="text-xl font-semibold">
                  ₹{parseFloat(totalsData.undeliveredAmount.toFixed(2))}/-
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Mode Summary */}
        <Card className="bg-zinc-900 border border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">
              Payment Mode Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white">
            {Object.keys(paymentData).length > 0 ? (
              Object.keys(paymentData).map((mode) => (
                <div
                  key={mode}
                  className="grid grid-cols-3 border-b border-zinc-700 py-1 px-2"
                >
                  <span className="capitalize">{mode}</span>
                  <span className="text-center">
                    {paymentData[mode].count} Inv
                  </span>
                  <span className="text-end">
                    ₹{parseFloat(paymentData[mode].total.toFixed(2))}/-
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">
                No payment data available.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border border-zinc-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Return Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-zinc-800 p-4 rounded-lg text-center">
                <p className="text-sm text-zinc-400">Total Return Invoices</p>
                <p className="text-xl font-semibold text-white">
                  {returnSummary?.totalReturnInvoices || 0} (₹
                  {(returnSummary?.totalReturnAmount || 0).toFixed(2)})
                </p>
              </div>
              <div className="bg-green-900 p-4 rounded-lg text-center">
                <p className="text-sm text-green-300">Paid Returns</p>
                <p className="text-lg font-bold text-green-100">
                  {returnSummary?.paidCount || 0} (₹
                  {(returnSummary?.paidAmount || 0).toFixed(2)})
                </p>
              </div>

              <div className="bg-red-900 p-4 rounded-lg text-center">
                <p className="text-sm text-red-300">Unpaid Returns</p>
                <p className="text-lg font-bold text-red-100">
                  {returnSummary?.unpaidCount || 0} (₹
                  {(returnSummary?.unpaidCount || 0).toFixed(2)})
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2 text-white">
                Patient-wise Returns
              </h4>
              <ScrollArea className="max-h-64 pr-2">
                {returnSummary?.patientWise?.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {returnSummary?.patientWise.map((patient, idx) => (
                      <div
                        key={patient.patientId || idx}
                        className="flex justify-between items-center border border-zinc-700 rounded p-2 bg-zinc-800 text-white"
                      >
                        <div>
                          <p className="font-medium">{patient.patientName}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p>Total: ₹{patient.totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-green-400">
                            Paid: ₹{patient.paidAmount.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-red-400">
                            Unpaid: ₹{patient.unpaidAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-sm">No patient returns.</p>
                )}
              </ScrollArea>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2 text-white">
                Medicine-wise Returns
              </h4>
              <ScrollArea className="max-h-64 pr-2">
                {returnSummary?.medicineWise?.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {returnSummary?.medicineWise.map((med, idx) => (
                      <div
                        key={med.medicineId || idx}
                        className="flex items-center justify-between border border-zinc-700 rounded p-2 bg-zinc-800"
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            title={med.name}
                            className="truncate max-w-[180px] text-white border-zinc-500"
                          >
                            {med.name || med.medicineId}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs sm:text-sm text-white">
                          <span>Qty: {med.quantity}</span>
                          <span>
                            Total: ₹{parseFloat(med.totalAmount.toFixed(2))}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-sm">No medicine returns.</p>
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPharmacy;
