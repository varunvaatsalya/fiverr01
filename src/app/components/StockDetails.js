// import React from "react";
// import { formatDateToIST } from "../utils/date";

// function StockDetails({ stockDetails, setStockDetails }) {
//   return (
//     <div className="absolute top-0 left-0">
//       <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
//         <div className="w-[95%] md:w-4/5 lg:w-3/4 py-4 flex flex-col items-center gap-1 text-center bg-slate-950 px-4 rounded-xl">
//           <div className="text-center py-2 px-4 rounded-full bg-slate-900 text-lg text-white font-semibold">
//             Medicine Stock Details
//           </div>
//           <div className="max-h-[60vh] w-full overflow-y-auto flex flex-col gap-2">
//             <pre className="">{JSON.stringify(stockDetails, null, 2)}</pre>
//             {stockDetails.stocks.length > 0 ? (
//               <>
//                 <div className="mb-1 flex flex-wrap items-center bg-gray-800 rounded-lg text-sm text-white">
//                   <div className="flex-1 min-w-24 px-0.5 line-clamp-1">
//                     Medicine
//                   </div>
//                   <div className="flex-1 min-w-24">Batch</div>
//                   <div className="flex-1 min-w-48">Expiry</div>
//                   <div className="flex-1 min-w-36">Quantity</div>
//                   <div className="flex-1 min-w-36">Free</div>
//                   <div className="flex-1 min-w-16">MRP</div>
//                   <div className="flex-1 min-w-16">Rate</div>
//                   <div className="flex-1 min-w-20">Subtotal</div>
//                 </div>
//                 {stockDetails.stocks.map((stock) => (
//                   <div
//                     key={stock.stockId._id}
//                     className="mb-1 flex flex-wrap items-center border-b border-gray-800 text-sm text-white"
//                   >
//                     <div className="flex-1 min-w-24 px-0.5 line-clamp-1">
//                       {stock.stockId.medicine?.name}
//                     </div>
//                     <div className="flex-1 min-w-24">
//                       {stock.stockId.batchName}
//                     </div>
//                     <div className="flex-1 min-w-48">
//                       {formatDateToIST(stock.stockId.expiryDate)}
//                     </div>
//                     <div className="flex-1 min-w-36">
//                       {stock.stockId.initialQuantity.totalStrips}
//                     </div>
//                     <div className="flex-1 min-w-36">
//                       {stock.stockId.initialQuantity.free}
//                     </div>
//                     <div className="flex-1 min-w-16">
//                       {stock.stockId.sellingPrice}
//                     </div>
//                     <div className="flex-1 min-w-16">
//                       {stock.stockId.purchasePrice}
//                     </div>
//                     <div className="flex-1 min-w-20">
//                       {stock.stockId.totalAmount}
//                     </div>
//                   </div>
//                 ))}
//               </>
//             ) : (
//               <div className="text-gray-500 font-semibold text-lg">
//                 *No Medicine Stock Records
//               </div>
//             )}
//           </div>
//           <div className="w-full flex px-4 gap-3 my-3 justify-end">
//             <div
//               className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
//               onClick={() => {
//                 setStockDetails(null);
//               }}
//             >
//               Cancel
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default StockDetails;

// components/InvoiceModal.tsx

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import Image from "next/image";

export default function StockDetails({ stockDetails, setStockDetails }) {
  const {
    invoiceNumber,
    vendorInvoiceId,
    invoiceDate,
    receivedDate,
    manufacturer,
    vendor,
    payments,
    stocks,
    grandTotal,
    isPaid,
    billImageId,
  } = stockDetails;

  return (
    <Dialog open={!!stockDetails} onOpenChange={() => setStockDetails(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden text-black">
        <DialogHeader className="flex flex-row justify-between items-center">
          <div>
            <DialogTitle className="text-xl">
              Invoice #{invoiceNumber}
            </DialogTitle>
            <DialogDescription>
              Date: {new Date(invoiceDate).toLocaleDateString()} | Received:{" "}
              {new Date(receivedDate).toLocaleDateString()}
            </DialogDescription>
          </div>

          {/* ℹ️ Info tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground">
                  <Info className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm text-xs">
                <p>
                  <strong>Purchase Price:</strong> Final buying price (after
                  taxes/discount)
                </p>
                <p>
                  <strong>Purchase Rate:</strong> Raw base rate before
                  discount/taxes
                </p>
                <p>
                  <strong>Cost Price:</strong> What it costs with all charges
                </p>
                <p>
                  <strong>Selling Price:</strong> Your MRP to sell
                </p>
                <p>
                  <strong>Discount:</strong> % off on base rate
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DialogHeader>

        {/* Vendor Info */}
        <div className="mb-4 text-sm flex justify-between gap-3 items-center">
          <div>
            <p>
              <strong>Vendor Invoice Id:</strong> {vendorInvoiceId}
            </p>
            {vendor && (
              <p>
                <strong>Vendor:</strong> {vendor?.name}
              </p>
            )}
            {manufacturer && (
              <p>
                <strong>Manufacturer:</strong> {manufacturer?.name}
              </p>
            )}
            <p>
              <strong>Contact:</strong>{" "}
              {vendor
                ? vendor.contact
                : manufacturer?.medicalRepresentator?.contact}
            </p>
            <p>
              <strong>Address:</strong> {vendor ? vendor.address : "-"}
            </p>
          </div>
          {billImageId && billImageId.filepath && (
            <div className="h-40 aspect-video">
              <Image
                height={800}
                width={800}
                src={`/api${billImageId.filepath}`}
                className="w-full h-full object-contain "
              />
            </div>
          )}
        </div>

        {/* Payment Info */}
        <div className="mb-4 text-sm">
          <h4 className="font-semibold">Payments</h4>
          {payments.map((pay) => (
            <div key={pay._id} className="text-muted-foreground mb-1">
              {new Date(pay.date).toLocaleDateString()} - {pay.mode} - ₹
              {pay.amount} {pay.referenceNumber && `(${pay.referenceNumber})`}
            </div>
          ))}
        </div>

        {/* Stocks Table */}
        <ScrollArea className="max-h-[280px] border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Prices</TableHead>
                <TableHead>Taxes</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.map((item) => {
                const stock = item.stockId;
                const qtyStr = `${stock.quantity.totalStrips} (${
                  stock.quantity.extra ? "~" : ""
                }${stock.quantity.boxes} Boxes)`;

                return (
                  <TableRow key={stock._id}>
                    <TableCell>{stock.medicine.name}</TableCell>
                    <TableCell>{stock.batchName}</TableCell>
                    <TableCell>
                      {new Date(stock.expiryDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>{qtyStr}</div>
                      {<div>offer: {stock.offer ?? "-"}</div>}
                    </TableCell>
                    <TableCell className="text-sm leading-tight">
                      <div>PP: ₹{stock.purchasePrice ?? "-"}</div>
                      <div>PR: ₹{stock.purchaseRate ?? "-"}</div>
                      <div>CP: ₹{stock.costPrice ?? "-"}</div>
                      <div>SP: ₹{stock.sellingPrice ?? "-"}</div>
                      <div>Disc: {stock.discount ?? 0}%</div>
                    </TableCell>
                    <TableCell>
                      {(stock.taxes?.sgst ?? 0) + (stock.taxes?.cgst ?? 0)}%
                      <br />
                      <span className="text-xs text-muted-foreground">
                        ({stock.taxes?.sgst ?? 0}% SGST +{" "}
                        {stock.taxes?.cgst ?? 0}% CGST)
                      </span>
                    </TableCell>
                    <TableCell>₹{stock.totalAmount ?? "-"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
        <DialogFooter className="mt-4 flex flex-col items-end gap-1 text-sm font-medium">
          <p>
            Status:{" "}
            <span className={isPaid ? "text-green-600" : "text-red-600"}>
              {isPaid ? "Paid" : "Unpaid"}
            </span>
          </p>
          <p>Total: ₹{grandTotal}</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
