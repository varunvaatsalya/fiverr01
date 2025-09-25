import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const ranges = [
  { label: "Expired", value: "expired" },
  { label: "15 Days", value: "15days" },
  { label: "1 Month", value: "1month" },
  { label: "3 Month", value: "3month" },
  { label: "6 Month", value: "6month" },
  { label: "1 Year", value: "1year" },
];

function StockExpiry({ stocks, loading, params, setParams, query, setQuery }) {
  const filteredStocks = stocks.filter((s) => {
    const q = query.toLowerCase();
    return s.medicine.name.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white">
      <div className="flex flex-col justify-around items-center">
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-full w-3/4 text-black text-xl font-medium px-4 py-2 rounded-full outline-none bg-gray-100 border-b-2 border-gray-400 focus:bg-gray-300"
        />
        <div className="flex justify-center gap-3 items-center my-2 font-semibold">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setParams(r.value)}
              className={
                "px-3 py-1 rounded-full border border-gray-900 text-gray-900 " +
                (params === r.value ? "bg-gray-900 text-white" : "")
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-2">
        <div className="bg-gray-900 text-white text-center font-semibold w-full md:w-4/5 lg:w-3/4 py-1 rounded-full mx-auto">
          List of Expiring Medicines
        </div>
        <Table className="text-black w-full md:w-4/5 lg:w-3/4 mx-auto mt-4">
          <TableCaption>
            {loading
              ? "Loading..."
              : filteredStocks.length === 0 && "*No Medicines Found"}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead className="w-[200px]">Medicine</TableHead>
              <TableHead className="w-[200px]">Salt</TableHead>
              <TableHead className="w-[120px]">Batch</TableHead>
              <TableHead className="w-[200px]">Expiry</TableHead>
              <TableHead className="w-[250px]">Quantity</TableHead>
              <TableHead className="w-[100px]">MRP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStocks.map((stock, stockIndex) => {
              const batchCount = stock.stocks.length || 1;
              return stock.stocks.length > 0 ? (
                stock.stocks.map((batch, batchIndex) => (
                  <TableRow key={batch._id}>
                    {batchIndex === 0 && (
                      <>
                        <TableCell rowSpan={batchCount}>
                          {stockIndex + 1}
                        </TableCell>
                        <TableCell rowSpan={batchCount}>
                          {stock.medicine.name}
                        </TableCell>
                        <TableCell rowSpan={batchCount}>
                          {stock.medicine.salts[0]?.name}
                        </TableCell>
                      </>
                    )}
                    <TableCell>{batch.batchName}</TableCell>
                    <TableCell>{`${format(
                      batch.expiryDate,
                      "dd-MMM-yyyy"
                    )}`}</TableCell>
                    <TableCell>
                      {batch.quantity
                        ? `${batch.quantity.totalStrips} Strips = ${
                            batch.quantity.boxes || 0
                          } Boxes, ${batch.quantity.extra || 0} Extras`
                        : "-"}
                    </TableCell>
                    <TableCell>{batch.sellingPrice}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow key={`no-stock-${stockIndex}`}>
                  <TableCell>{stockIndex + 1}</TableCell>
                  <TableCell>{stock.medicine.name}</TableCell>
                  <TableCell>{stock.medicine.salts[0]?.name}</TableCell>
                  <TableCell colSpan={4} className="text-center text-red-600">
                    No Expiring Stocks found
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default StockExpiry;
