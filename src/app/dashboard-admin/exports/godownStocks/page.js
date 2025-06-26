"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { showError } from "@/app/utils/toast";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

function Page() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let res = await fetch("/api/exports/godownStocks");
        res = await res.json();
        if (res.success) {
          setStockData(res.stockData);
        } else showError(res.message);
      } catch (error) {
        console.log(error);
        showError("data fetching error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const exportToExcel = () => {
    setExporting(true);
    // Flatten nested objects like `medicine.name` and `quantity`
    const formattedData = stockData.map((item) => ({
      Medicine: item.medicine?.name || "—",
      Batch: item.batchName,
      "Mfg Date": item.mfgDate
        ? new Date(item.mfgDate).toLocaleDateString()
        : "N/A",
      "Expiry Date": item.expiryDate
        ? new Date(item.expiryDate).toLocaleDateString()
        : "N/A",
      "Unit Per Box": item.medicine?.packetSize ? item.medicine.packetSize.strips : "-",
      "Tablets Per Strip": item.medicine?.packetSize
        ? item.medicine.packetSize.tabletsPerStrip
        : "-",
      Boxes: item.quantity?.boxes ?? 0,
      Extra: item.quantity?.extra ?? 0,
      "Total Strips": item.quantity?.totalStrips ?? 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock");

    XLSX.writeFile(workbook, `stock-data.xlsx`);
    setExporting(false);
  };

  return (
    <div>
      <Navbar route={["Exports", "Godown Stock"]} />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <div className="flex justify-end px-4 py-2 text-black">
            <Button
              disabled={exporting}
              onClick={exportToExcel}
              variant="outline"
            >
              {exporting ? "Exporting..." : "Export"}
            </Button>
          </div>
          <div className="rounded-md border overflow-auto p-4 text-black">
            <Table>
              <TableHeader className="bg-gray-200">
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Manufacture Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Boxes</TableHead>
                  <TableHead>Extra</TableHead>
                  <TableHead>Total Strips</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockData.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.medicine?.name || "—"}</TableCell>
                    <TableCell>{item.batchName}</TableCell>
                    <TableCell>
                      {item.mfgDate
                        ? format(new Date(item.mfgDate), "dd-MM-yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {item.expiryDate
                        ? format(new Date(item.expiryDate), "dd-MM-yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell>{item.quantity?.boxes ?? 0}</TableCell>
                    <TableCell>{item.quantity?.extra ?? 0}</TableCell>
                    <TableCell>{item.quantity?.totalStrips ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

export default Page;
