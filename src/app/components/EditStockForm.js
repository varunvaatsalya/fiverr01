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

  useEffect(() => {
    fetch(`/api/newStock?batchInfo=1`)
      .then((res) => res.json())
      .then((data) => {
        setStocks(data.stocks);
        console.log(data.stocks);
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

  return (
    <div className="p-4 space-y-2">
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

          <div className="grid grid-cols-4 gap-4 font-semibold text-sm text-gray-700 border-b pb-2">
            <div>Batch</div>
            <div>Expiry</div>
            <div>Total Strips</div>
            <div>Qty (Box + Extra)</div>
          </div>
          <div className="space-y-1">
            {med.stocks.map((stock) => (
              <div
                key={stock._id}
                className="grid grid-cols-4 gap-2 items-center py-1"
              >
                <div>{stock.batchName}</div>
                <div>{formatDateToIST(stock.expiryDate)}</div>

                <div>
                  <Input
                    type="number"
                    className="w-full"
                    value={stock.quantity.totalStrips}
                    onChange={(e) =>
                      handleStripsChange(
                        med.medicineId,
                        stock._id,
                        parseInt(e.target.value || "0"),
                        med.packetSize.strips
                      )
                    }
                  />
                </div>

                <div className="text-sm text-gray-800">
                  {stock.quantity.boxes} box + {stock.quantity.extra} extra
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
      <Button
        onClick={handleUpdate}
        disabled={submitting || changedStocks.length === 0}
      >
        {submitting ? "Wait..." : "Update"}
      </Button>
    </div>
  );
}
