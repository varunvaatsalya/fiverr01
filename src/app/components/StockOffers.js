"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import { formatDateTimeToIST } from "../utils/date";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { GrHistory } from "react-icons/gr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showError, showInfo } from "../utils/toast";
import { RxCrossCircled } from "react-icons/rx";

function StockOffers() {
  const [medicines, setMedicines] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOffers, setSelectedOffers] = useState([]);

  const [selectedMed, setSelectedMed] = useState(null);
  const [buyQty, setBuyQty] = useState("");
  const [freeQty, setFreeQty] = useState("");

  const [medQuery, setMedQuery] = useState("");
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [isMedicineListFocused, setIsMedicineListFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newMedicine/stockOffers");
        result = await result.json();
        if (result.success) {
          setMedicines(result.medicines);
          console.log(result.medicines);
        }
      } catch (err) {
        console.log("error: ", err);
        showError("error in loading data");
      }
    }
    fetchData();
  }, []);

  const handleAddOffer = async () => {
    if (!selectedMed || !buyQty || !freeQty) return;

    try {
      setSubmitting(true);
      let result = await fetch(`/api/newMedicine/stockOffers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medId: selectedMed._id,
          buyingQty: buyQty,
          offerQty: freeQty,
        }),
      });
      result = await result.json();

      if (result.success) {
        setMedicines((prev) => {
          const exists = prev.find((m) => m._id === result.newOffer._id);
          if (exists) {
            return prev.map((m) =>
              m._id === result.newOffer._id ? result.newOffer : m
            );
          } else {
            return [result.newOffer, ...prev];
          }
        });

        setSelectedMed(null);
        setMedQuery("");
        setMedicineOptions([]);
        setBuyQty("");
        setFreeQty("");
      }
      showInfo(result.message);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const medTimer = setTimeout(async () => {
      if (!medQuery) {
        return;
      }
      try {
        let result = await fetch(`/api/searchMedicine`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: medQuery,
          }),
        });
        result = await result.json();
        if (result.success) {
          setMedicineOptions(result.medicines);
        }
      } catch (err) {
        console.error("Error fetching medicines:", err);
      }
    }, 350);
    return () => clearTimeout(medTimer);
  }, [medQuery]);

  return (
    <div className="p-2 w-full md:w-4/5 lg:w-3/4 space-y-2 flex flex-col items-center mx-auto">
      {/* Add Offer Section */}
      <div className="border rounded-md w-full flex gap-2 justify-center items-center text-black">
        {!selectedMed ? (
          <div className="relative w-full">
            <Command className="mb-2 px-3 py-1 text-gray-900 w-full bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out">
              <CommandInput
                placeholder="Search Medicine to add new offer..."
                onFocus={() => setIsMedicineListFocused(true)}
                onBlur={() =>
                  setTimeout(() => setIsMedicineListFocused(false), 250)
                }
                onValueChange={(value) => {
                  setMedQuery(value);
                }}
              />
              {isMedicineListFocused && (
                <CommandList className="absolute bg-gray-600 rounded-lg max-h-52 top-12 left-0 my-1 w-full z-50">
                  {medicineOptions.map((m) => {
                    return (
                      <CommandItem
                        key={m._id}
                        value={m.name}
                        onSelect={() => {
                          setSelectedMed(m);
                        }}
                        className="flex items-center justify-between gap-2 px-2 py-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            <GrHistory />
                          </span>
                          <span className="truncate">{m.name}</span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandList>
              )}
            </Command>
          </div>
        ) : (
          <>
            <div className="w-full flex flex-wrap justify-center gap-4 items-center">
              <div className="font-semibold">
                Medicine:{" "}
                <span className="text-blue-500 uppercase">
                  {selectedMed?.name}
                </span>
              </div>
              <button
                className="px-2 py-1 text-red-500 hover:text-red-700 text-sm rounded-lg font-semibold"
                onClick={() => {
                  setSelectedMed(null);
                }}
              >
                <RxCrossCircled className="size-4" />
              </button>
            </div>
            <Input
              type="number"
              placeholder="Buy Qty"
              value={buyQty}
              onChange={(e) => setBuyQty(e.target.value)}
              className="bg-white"
            />
            <Input
              type="number"
              placeholder="Free Qty"
              value={freeQty}
              onChange={(e) => setFreeQty(e.target.value)}
              className="bg-white"
            />
            <Button onClick={handleAddOffer} disabled={submitting}>
              {submitting ? "Adding..." : "Add Offer"}
            </Button>
          </>
        )}
      </div>

      <hr className="w-full border-gray-400 my-1" />

      {/* Offers List */}
      <div className="space-y-1 w-full">
        {medicines.map((med) => {
          const latestOffer = med.offers?.[med.offers.length - 1];
          return (
            <div
              key={med._id}
              className="border p-2 rounded-lg shadow-sm flex justify-between items-center bg-white text-black"
            >
              <div className="font-medium">{med.name}</div>
              {latestOffer ? (
                <>
                  <div className="text-sm">
                    {latestOffer.buyingQty + " + " + latestOffer.offerQty}
                  </div>
                  <div className="text-sm">
                    {formatDateTimeToIST(latestOffer.createdAt)}
                  </div>
                </>
              ) : (
                <div className="text-sm">No current offer</div>
              )}
              <Button
                variant="link"
                disabled={med.offers?.length <= 1}
                onClick={() => {
                  setSelectedOffers(med.offers);
                  setDialogOpen(!dialogOpen);
                }}
              >
                {med.offers?.length > 1 ? "View History" : "No Offer History"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Offer History Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle>Offer History</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {selectedOffers.map((offer, i) => (
              <div
                key={i}
                className="border p-2 rounded text-sm flex justify-between"
              >
                <span>{offer.buyingQty + " + " + offer.offerQty}</span>
                <span>{formatDateTimeToIST(offer.createdAt)}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StockOffers;
