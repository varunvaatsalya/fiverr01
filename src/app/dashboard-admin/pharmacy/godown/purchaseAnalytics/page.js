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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Navbar from "@/app/components/Navbar";
import { showError } from "@/app/utils/toast";

export default function PurchaseInvoiceReport() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [type, setType] = useState("medicine");

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      showError("Both dates are required!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/purchaseAnalytics?start=${startDate}&end=${endDate}&type=${type}`
      );
      const data = await res.json();

      if (data.success) {
        setReport(data);
      } else showError(data.message || "Fetch Error");
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
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <Select
              value={type || ""}
              onValueChange={(val) => {
                setType(val);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendor">Vendor Wise</SelectItem>
                <SelectItem value="medicine">Medicine Wise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={fetchReport} disabled={loading}>
            {loading ? "Fetching..." : "Get Report"}
          </Button>
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
        {!loading && report?.vendorWise && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>
                  Summary ({report.summary.totalInvoices} Invoices)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {type != "medicine" && (
                  <>
                    <div>
                      <strong>Total Amount:</strong>
                      <div>₹ {report.summary.grandTotal}</div>
                    </div>
                    <div>
                      <strong>Paid:</strong>
                      <div className="text-green-600">
                        ₹ {parseFloat(report.summary.totalPaid?.toFixed(2))}
                      </div>
                    </div>
                    <div>
                      <strong>Unpaid:</strong>
                      <div className="text-red-600">
                        ₹ {parseFloat(report.summary.totalUnpaid?.toFixed(2))}
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <strong>Date Range:</strong>
                  <div>
                    {new Date(report.range.startDate).toLocaleDateString()} -{" "}
                    {new Date(report.range.endDateFinal).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
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
                        <TableCell>
                          ₹ {parseFloat(v.amount?.toFixed(2))}
                        </TableCell>
                        <TableCell className="text-green-600">
                          ₹ {parseFloat(v.paid?.toFixed(2))}
                        </TableCell>
                        <TableCell className="text-red-600">
                          ₹ {parseFloat(v.unpaid?.toFixed(2))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {!loading && report?.medicineWise && (
          <div className="space-y-2">
            {report?.medicineWise.map((med, idx) => (
              <Card key={idx} className="shadow-md border ">
                {/* Header with medicine + manufacturer on left, totals on right */}
                <CardHeader className="flex flex-row flex-wrap items-center justify-between bg-gray-100 rounded-lg py-2">
                  <div>
                    <CardTitle className="space-x-2">
                      <span className="text-lg font-bold">
                        {med.medicineName}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({med.manufacturerName})
                      </span>
                    </CardTitle>
                  </div>
                  <div className="flex gap-1 text-sm">
                    <div>
                      <span className="font-semibold">Strips: </span>
                      {med.totalQtyStrips}
                    </div>
                    <div>
                      <span className="font-semibold">Amount: </span>₹
                      {med.totalAmount.toLocaleString()}
                    </div>
                  </div>
                </CardHeader>

                {/* Vendor table */}
                <CardContent className="py-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/2">Vendor</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Boxes</TableHead>
                        <TableHead>Strips</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {med.vendors.map((vendor, vIdx) => (
                        <TableRow key={vIdx}>
                          <TableCell>{vendor.name}</TableCell>
                          <TableCell>{vendor.purchaseCount}</TableCell>
                          <TableCell>{vendor.totalQtyBoxes}</TableCell>
                          <TableCell>{vendor.totalQtyStrips}</TableCell>
                          <TableCell>
                            ₹{vendor.totalAmount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
