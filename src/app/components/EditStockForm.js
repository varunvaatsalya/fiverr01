"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatDateToIST } from "@/app/utils/date";
import { showSuccess, showError } from "@/app/utils/toast";
import { Button } from "@/components/ui/button";

export default function EditStockForm() {
  const [stocks, setStocks] = useState([]);
  const [changedStocks, setChangedStocks] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [accessInfo, setAccessInfo] = useState(null);

  useEffect(() => {
    fetch(`/api/newStock?batchInfo=1`)
      .then((res) => res.json())
      .then((data) => {
        setStocks(data.stocks);
        setAccessInfo(data.accessInfo);
      });
  }, []);

  const calculateBoxesAndExtra = (strips, stripsPerBox) => {
    const boxes = Math.floor(strips / stripsPerBox);
    const extra = strips % stripsPerBox;
    return { boxes, extra };
  };

  const handleStripsChange = (medicineId, stockId, strips, stripsPerBox) => {
    setStocks((prev) =>
      prev.map((med) =>
        med.medicineId === medicineId
          ? {
              ...med,
              stocks: med.stocks.map((stock) =>
                stock._id === stockId
                  ? {
                      ...stock,
                      quantity: {
                        ...stock.quantity,
                        totalStrips: strips,
                        ...calculateBoxesAndExtra(strips, stripsPerBox),
                      },
                    }
                  : stock
              ),
            }
          : med
      )
    );

    setChangedStocks((prev) => {
      const exists = prev.find((p) => p.stockId === stockId);
      if (exists) {
        return prev.map((p) =>
          p.stockId === stockId ? { ...p, totalStrips: strips } : p
        );
      } else {
        return [...prev, { stockId, totalStrips: strips }];
      }
    });
  };

  const handleMRPChange = (medicineId, stockId, mrp) => {
    let sellingPrice = parseFloat((mrp || 0)?.toFixed(2));
    setStocks((prev) =>
      prev.map((med) =>
        med.medicineId === medicineId
          ? {
              ...med,
              stocks: med.stocks.map((stock) =>
                stock._id === stockId
                  ? {
                      ...stock,
                      sellingPrice,
                    }
                  : stock
              ),
            }
          : med
      )
    );

    setChangedStocks((prev) => {
      const exists = prev.find((p) => p.stockId === stockId);
      if (exists) {
        return prev.map((p) =>
          p.stockId === stockId ? { ...p, sellingPrice } : p
        );
      } else {
        return [...prev, { stockId, sellingPrice }];
      }
    });
  };

  async function handleUpdate() {
    setSubmitting(true);
    try {
      let result = await fetch("/api/newStock", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stocks: changedStocks }),
      });
      result = await result.json();
      if (result.success) {
        setChangedStocks([]);
        showSuccess(result.message);
      } else {
        showError(result.message);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      showError("Error in submitting application from client side");
    } finally {
      setSubmitting(false);
    }
  }

  if (!accessInfo || !accessInfo?.userEditPermission) {
    return (
      <div className="w-[95%] md:w-4/5 lg:w-3/4 text-center bg-red-200 text-red-700 py-2 text-lg font-semibold rounded-xl mx-auto my-2">
        Access Denied!
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <Button
        onClick={handleUpdate}
        disabled={submitting || changedStocks.length === 0}
      >
        {submitting ? "Wait..." : "Update"}
      </Button>
      {stocks.map((med) => (
        <Card key={med.medicineId} className="p-4 space-y-2 border">
          <div className="flex items-center justify-start px-4 gap-4">
            <h2 className="text-lg font-bold">{med.medicine}</h2>
            <p className="text-sm text-gray-600">
              Packet Size: {med.packetSize.strips}{" "}
              {med.isTablets
                ? "strips/box, " +
                  med.packetSize.tabletsPerStrip +
                  " tablets/strip"
                : "units/box"}
            </p>
          </div>

          <div className="grid grid-cols-5 gap-4 font-semibold text-sm text-gray-700 border-b pb-2">
            <div>Batch</div>
            <div>Expiry</div>
            <div>MRP</div>
            <div>Total Strips</div>
            <div>Qty (Box + Extra)</div>
          </div>
          <div className="space-y-1">
            {med.stocks.map((stock) => (
              <div
                key={stock._id}
                className="grid grid-cols-5 gap-2 items-center py-1"
              >
                <div>{stock.batchName}</div>
                <div>{formatDateToIST(stock.expiryDate)}</div>

                <div className="flex justify-between items-center gap-2">
                  <Input
                    type="number"
                    className="w-full"
                    value={stock.sellingPrice || ""}
                    onChange={(e) =>
                      handleMRPChange(
                        med.medicineId,
                        stock._id,
                        parseFloat(e.target.value || 0)
                      )
                    }
                  />
                </div>
                <div className="flex justify-between items-center gap-2">
                  <Input
                    type="number"
                    className="w-full"
                    value={stock.quantity.totalStrips || ""}
                    onChange={(e) =>
                      handleStripsChange(
                        med.medicineId,
                        stock._id,
                        parseInt(e.target.value || "0"),
                        med.packetSize.strips
                      )
                    }
                  />
                  {changedStocks.some((stk) => stk.stockId === stock._id) && (
                    <div className="rounded px-2 text-sm bg-red-200 text-red-800 font-semibold">
                      Edited
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-800">
                  {stock.quantity.boxes} box + {stock.quantity.extra} extra
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
