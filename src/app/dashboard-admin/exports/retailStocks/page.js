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
import { Button } from "@/components/ui/button";

function Page() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let res = await fetch("/api/exports/retailStocks");
        res = await res.json();
        if (res.success) {
          setStockData(res.retailStockData);
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
    try {
      const formattedData = stockData.map((item) => ({
        Medicine: item.medicineName || "N/A",
        Mfg: item.manufacturerName || "N/A",
        "Total Strips": item.totalStrips ?? 0,
        Boxes: item.totalBoxes ?? 0,
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock");

      XLSX.writeFile(workbook, `retail-stock-data.xlsx`);
    } catch (error) {
      showError("Failed to generate sheet!");
    } finally {
      // Flatten nested objects like `medicine.name` and `quantity`
      setExporting(false);
    }
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
                  <TableHead>Sr No.</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Mfg</TableHead>
                  <TableHead>Total Strips</TableHead>
                  <TableHead>Total Boxes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockData.map((item, it) => (
                  <TableRow key={item.medicineId}>
                    <TableCell>{it + 1 + "."}</TableCell>
                    <TableCell>{item.medicineName || "N/A"}</TableCell>
                    <TableCell>{item.manufacturerName || "N/A"}</TableCell>
                    <TableCell>{item.totalStrips ?? 0}</TableCell>
                    <TableCell>{item.totalBoxes ?? 0}</TableCell>
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
