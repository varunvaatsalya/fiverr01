"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

function MedicineSellRecord({
  medicineData,
  lastUpdated,
  monthYear,
  loading,
  updateData,
}) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const [search, setSearch] = useState("");

  // Filtered data by medicineName or saltName
  const filteredData = useMemo(() => {
    if (!search.trim()) return medicineData;
    const lowerSearch = search.toLowerCase();
    return medicineData?.filter(
      (m) =>
        m.medicineName.toLowerCase().includes(lowerSearch) ||
        (m.saltName && m.saltName.toLowerCase().includes(lowerSearch))
    );
  }, [search, medicineData]);

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 text-black bg-white rounded-md border border-gray-200 shadow-sm p-4">
      {/* Top controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {lastUpdated && (
          <p className="text-sm text-muted-foreground">
            Last Updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}

        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search by Medicine or Salt"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={updateData}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              "Updating..."
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Update Data
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Table wrapper */}
      {loading ? (
        <div className="text-center p-3">Please Wait...</div>
      ) : (
        <ScrollArea className="flex-1 rounded-lg border">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-gray-50 sticky top-0 z-10">
              <TableRow>
                <TableCell className="font-semibold text-sm">
                  Medicine
                </TableCell>
                <TableCell className="font-semibold text-sm">Salt</TableCell>
                {monthYear?.map((m) => (
                  <TableCell
                    key={`${m.year}-${m.month}`}
                    className="font-semibold text-sm"
                  >
                    {monthNames[m.month - 1]} {m.year}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData?.map((trend) => (
                <TableRow key={trend._id} className="hover:bg-gray-50">
                  <TableCell>{trend.medicineName}</TableCell>
                  <TableCell>{trend.saltName}</TableCell>
                  {monthYear?.map((m, idx) => {
                    const monthlyRecord = trend.monthlyData.find(
                      (d) => d.year === m.year && d.month === m.month
                    );

                    const tablets = monthlyRecord?.totalSoldTablets || 0;
                    const invoices = monthlyRecord?.totalInvoices || 0;
                    const revenue =
                      parseFloat(monthlyRecord?.totalRevenue?.toFixed(2)) || 0;
                    const strips =
                      parseFloat(monthlyRecord?.totalSoldStrips?.toFixed(2)) ||
                      0;

                    let change = null;
                    if (idx > 0) {
                      const prevRecord = trend.monthlyData.find(
                        (d) =>
                          d.year === monthYear[idx - 1].year &&
                          d.month === monthYear[idx - 1].month
                      );
                      if (prevRecord) {
                        const diff = tablets - prevRecord.totalSoldTablets;
                        change =
                          diff > 0 ? (
                            <ArrowUp
                              className="inline text-green-500 ml-1"
                              size={16}
                            />
                          ) : diff < 0 ? (
                            <ArrowDown
                              className="inline text-red-500 ml-1"
                              size={16}
                            />
                          ) : null;
                      }
                    }

                    return (
                      <TableCell key={`${trend._id}-${m.year}-${m.month}`}>
                        <div>
                          <span className="font-medium capitalize">
                            {trend.unitLabelLevel1 || "Pack"}:
                          </span>{" "}
                          {strips}
                          {change}
                        </div>
                        <div>
                          <span className="font-medium">Revenue:</span> ₹
                          {revenue}
                        </div>
                        <div>
                          <span className="font-medium">Invoices:</span>{" "}
                          {invoices}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
}

export default MedicineSellRecord;

// <div className="w-full flex-1 min-h-0 px-2 text-gray-900 bg-slate-200">
//   <div className="flex flex-wrap justify-end gap-2 items-center my-0.5">
//     <button
//       disabled={loading}
//       onClick={updateData}
//       className="px-3 py-1 flex items-center justify-center gap-2 bg-blue-500 rounded-lg font-semibold cursor-pointer text-white"
//     >
//       {loading ? "Wait..." : "Update"}
//     </button>
//   </div>
//   <div className="overflow-x-auto flex-1 min-h-0 mt-1 bg-white shadow-md rounded-xl">
//     <table className="min-w-full table-auto text-sm">
//       <thead className="bg-gray-100">
//         <tr>
//           {["Name", "1m", "2m", "3m", "6m", "12m", "Last Update"].map(
//             (col) => (
//               <th
//                 key={col}
//                 className="py-2 px-4 text-left select-none hover:bg-gray-200 font-semibold transition whitespace-nowrap"
//               >
//                 <div className="flex items-center gap-2">{col}</div>
//               </th>
//             )
//           )}
//         </tr>
//       </thead>
//       <tbody>
//         {medicineData.map((med) => (
//           <tr
//             key={med._id}
//             className="border-t hover:bg-gray-50 transition whitespace-nowrap"
//           >
//             <td className="py-2 px-4">{med.name}</td>
//             <td className="py-2 px-4">
//               {med.avgMonthlyBoxes ? med.avgMonthlyBoxes["1m"] : "--"}
//             </td>
//             <td className="py-2 px-4">
//               {med.avgMonthlyBoxes ? med.avgMonthlyBoxes["2m"] : "--"}
//             </td>
//             <td className="py-2 px-4">
//               {med.avgMonthlyBoxes ? med.avgMonthlyBoxes["3m"] : "--"}
//             </td>
//             <td className="py-2 px-4">
//               {med.avgMonthlyBoxes ? med.avgMonthlyBoxes["6m"] : "--"}
//             </td>
//             <td className="py-2 px-4">
//               {med.avgMonthlyBoxes ? med.avgMonthlyBoxes["12m"] : "--"}
//             </td>

//             <td className="py-2 px-4">
//               {med.avgMonthlyBoxes
//                 ? formatDateToIST(med.avgMonthlyBoxes.savedAt)
//                 : "--"}
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// </div>
