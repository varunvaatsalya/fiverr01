"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { showError } from "@/app/utils/toast";
import Navbar from "@/app/components/Navbar";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

function Page() {
  const [medicineData, setMedicineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let res = await fetch("/api/exports/medicineData");
        res = await res.json();
        if (res.success) {
          setMedicineData(res.medicines);
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

  const exportMedicinesToExcel = () => {
    setExporting(true);
    const formattedData = medicineData.map((item) => ({
      Name: item.name,
      Manufacturer: item.manufacturer?.name ?? "—",
      Salt: item.salts?.name ?? "—",
      "Medicine Type": item.medicineType ?? "—",
      "Is Tablet": item.isTablets ? 1 : 0,
      "Unit Per Box": item.packetSize.strips,
      "Tablets Per Strip": item.packetSize.tabletsPerStrip,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Medicines");
    XLSX.writeFile(wb, `medicineData.xlsx`);
    setExporting(false);
  };

  return (
    <div>
      <Navbar route={["Exports", "Medicine Data"]} />
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <div className="flex justify-end px-4 py-2 text-black">
            <Button
              disabled={exporting}
              onClick={exportMedicinesToExcel}
              variant="outline"
            >
              {exporting ? "Exporting..." : "Export"}
            </Button>
          </div>
          <div className="border rounded-md px-4 overflow-auto text-black">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Salt</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tablet?</TableHead>
                  <TableHead>Packet Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicineData.map((med) => (
                  <TableRow key={med._id}>
                    <TableCell>{med.name}</TableCell>
                    <TableCell>{med.manufacturer?.name ?? "—"}</TableCell>
                    <TableCell>{med.salts?.name ?? "—"}</TableCell>
                    <TableCell>{med.medicineType ?? "—"}</TableCell>
                    <TableCell>{med.isTablets ? "Yes" : "No"}</TableCell>
                    <TableCell>{`${med.packetSize.strips} x ${med.packetSize.tabletsPerStrip}`}</TableCell>
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
