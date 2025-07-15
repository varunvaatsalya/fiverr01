"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Navbar from "@/app/components/Navbar";
import { showError } from "@/app/utils/toast";

export default function PurchaseInvoiceReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/purchaseAnalytics?start=${startDate}&end=${endDate}`
      );
      const data = await res.json();

      if (data.success) setReport(data);
      else showError(data.message || "Fetch Error");
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <Navbar route={["Pharmacy", "Purchase Analytics"]} />
      <div className="max-w-4xl mx-auto mt-8 space-y-6 text-black">
        {/* Filter Inputs */}
        <Card className="flex gap-4 items-end p-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button onClick={fetchReport}>Get Report</Button>
        </Card>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {/* Report Summary */}
        {!loading && report && (
          <Card>
            <CardHeader>
              <CardTitle>
                Summary ({report.summary.totalInvoices} Invoices)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Total Amount:</strong>
                <div>₹ {report.summary.grandTotal}</div>
              </div>
              <div>
                <strong>Paid:</strong>
                <div className="text-green-600">
                  ₹ {report.summary.totalPaid}
                </div>
              </div>
              <div>
                <strong>Unpaid:</strong>
                <div className="text-red-600">
                  ₹ {report.summary.totalUnpaid}
                </div>
              </div>
              <div>
                <strong>Date Range:</strong>
                <div>
                  {new Date(report.range.startDate).toLocaleDateString()} -{" "}
                  {new Date(report.range.endDateFinal).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vendor-wise Table */}
        {!loading && report?.vendorWise && (
          <Card>
            <CardHeader>
              <CardTitle>Vendor / Manufacturer Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Total Invoices</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Unpaid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.vendorWise.map((v, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{v.name}</TableCell>
                      <TableCell>{v.totalInvoices}</TableCell>
                      <TableCell>₹ {v.amount}</TableCell>
                      <TableCell className="text-green-600">
                        ₹ {v.paid}
                      </TableCell>
                      <TableCell className="text-red-600">
                        ₹ {v.unpaid}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
