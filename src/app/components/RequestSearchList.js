import React, { useMemo } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

function RequestSearchList({
  stockRequests,
  limit = 50,
  page = 1,
  setPage,
  query,
  setQuery,
  selectedStatus,
  setSelectedStatus,
}) {
  const statuses = [
    {
      label: "All",
      value: "All",
    },
    {
      label: "Fulfilled",
      value: "Fulfilled",
    },
    {
      label: "Fulfilled (Partial)",
      value: "Fulfilled (Partial)",
    },
    {
      label: "Pending",
      value: "Pending",
    },
    {
      label: "Approved",
      value: "Approved",
    },
    {
      label: "Returned",
      value: "Returned",
    },
    {
      label: "Rejected",
      value: "Rejected",
    },
    {
      label: "Disputed",
      value: "Disputed",
    },
  ];

  const statusStyle = {
    All: "bg-white text-black",
    Fulfilled: "bg-green-200 text-green-700",
    "Fulfilled (Partial)": "bg-teal-200 text-teal-700",
    Pending: "bg-yellow-200 text-yellow-700",
    Approved: "bg-violet-200 text-violet-700",
    Returned: "bg-pink-200 text-pink-600",
    Rejected: "bg-red-200 text-red-600",
    Disputed: "bg-rose-200 text-rose-600",
  };

  const handleNextPage = () => {
    if (stockRequests.length === limit) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const offset = useMemo(() => limit * (page - 1), [limit, page]);

  const tableHeaderLables = [
    "#",
    "Medicine",
    "Manufacturer",
    "Status",
    "Requested Qty",
    "Remaining Qty",
    "Approved At",
    "Received Status",
    "Received At",
    "Requested Date",
  ];

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col bg-gray-100">
      <div className="flex justify-between items-center gap-4 flew-wrap p-3 text-black">
        <Input
          type="text"
          placeholder="Search medicine..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="lg:w-1/4 rounded-full"
        />

        <div className="flex gap-3 items-center font-semibold">
          <Label htmlFor="status">Status:</Label>
          <Select
            id="status"
            value={selectedStatus}
            onValueChange={(value) => {
              setSelectedStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className={statusStyle[selectedStatus]}>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {stockRequests.length > 0 ? (
          <Table className="text-sm text-black border border-gray-300">
            <TableCaption>Stock Requests with Allocations</TableCaption>
            <TableHeader>
              <TableRow className="bg-gray-200">
                {tableHeaderLables.map((header, index) => (
                  <TableHead
                    key={index}
                    className="sticky top-0 bg-gray-200 z-10"
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockRequests.map((req, index) => {
                let medicine = req.medicineData;
                // let label0 = medicine.unitLabels?.level0
                //   ? `${medicine.unitLabels.level0}s`
                //   : "tablets";

                let label1 = medicine.unitLabels?.level1
                  ? `${medicine.unitLabels.level1}s`
                  : medicine.isTablets
                  ? "strips"
                  : "units";

                let label2 = medicine.unitLabels?.level2
                  ? medicine.unitLabels.level2
                  : "Boxes";

                return (
                  <>
                    {/* Main Row */}
                    <TableRow
                      key={req._id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <TableCell>{offset + index + 1 + "."}</TableCell>
                      <TableCell className="font-semibold">
                        {medicine?.name}
                      </TableCell>
                      <TableCell>{req.manufacturerData?.name}</TableCell>
                      <TableCell>
                        <span
                          className={
                            "px-2 py-0.5 rounded " + statusStyle[req.status]
                          }
                        >
                          {req.status}
                        </span>
                      </TableCell>
                      <TableCell>{req.requestedQuantity}</TableCell>
                      <TableCell>
                        {req.enteredRemainingQuantity} /{" "}
                        {req.actualRemainingQuantity}
                      </TableCell>
                      <TableCell>
                        {req.approvedAt
                          ? format(new Date(req.approvedAt), "dd/MM/yyyy HH:mm")
                          : "--"}
                      </TableCell>
                      <TableCell>{req.receivedStatus}</TableCell>
                      <TableCell>
                        {req.receivedAt
                          ? format(new Date(req.receivedAt), "dd/MM/yyyy HH:mm")
                          : "--"}
                      </TableCell>
                      <TableCell>
                        {req.createdAt
                          ? format(new Date(req.createdAt), "dd/MM/yyyy HH:mm")
                          : "--"}
                      </TableCell>
                    </TableRow>

                    {/* Approved Stocks Sub-Table */}
                    <TableRow className="bg-gray-100/70">
                      <TableCell colSpan={10}>
                        <div className="font-semibold text-violet-700 mb-1">
                          Approved Stocks
                        </div>
                        {req.approvedQuantity.length > 0 ? (
                          <Table className="border">
                            <TableHeader>
                              <TableRow className="bg-gray-200">
                                <TableHead>Batch</TableHead>
                                <TableHead>MFG</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Purchase Price</TableHead>
                                <TableHead>MRP</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {req.approvedQuantity.map((stock) => {
                                const {
                                  boxes = 0,
                                  extra = 0,
                                  totalStrips = 0,
                                } = stock.quantity || {};
                                let stockText = `Total ${label1}: ${totalStrips} = ${label2}: ${boxes}, Extra ${label1}: ${extra}`;
                                return (
                                  <TableRow key={stock._id}>
                                    <TableCell>{stock.batchName}</TableCell>
                                    <TableCell>
                                      {stock.mfgDate
                                        ? format(
                                            new Date(stock.mfgDate),
                                            "MM/yyyy"
                                          )
                                        : "--"}
                                    </TableCell>
                                    <TableCell>
                                      {format(
                                        new Date(stock.expiryDate),
                                        "MM/yyyy"
                                      )}
                                    </TableCell>
                                    <TableCell>{stockText}</TableCell>
                                    <TableCell>{stock.purchasePrice}</TableCell>
                                    <TableCell>{stock.sellingPrice}</TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-red-600 font-medium">
                            No approved stock available
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  </>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="font-semibold text-lg text-red-400 text-center">
            *No Requests Found
          </div>
        )}
      </div>

      <div className="w-full flex justify-end py-2 px-4 border-t border-gray-300 bg-gray-100">
        <div className="flex items-center bg-gray-900 text-white rounded-lg overflow-hidden">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1}
            className="p-3 disabled:opacity-40"
          >
            <FaArrowLeft size={18} />
          </button>
          <span className="px-4 py-2 border-x border-white">Page {page}</span>
          <button
            onClick={handleNextPage}
            disabled={stockRequests.length < limit}
            className="p-3 disabled:opacity-40"
          >
            <FaArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequestSearchList;
