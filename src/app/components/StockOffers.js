"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect, useMemo, useState } from "react";
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
import { format } from "date-fns";

function StockOffers() {
  const [medicines, setMedicines] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOffers, setSelectedOffers] = useState([]);

  const [selectedMed, setSelectedMed] = useState(null);
  const [buyQty, setBuyQty] = useState("");
  const [freeQty, setFreeQty] = useState("");
  const [agreedRate, setAgreedRate] = useState("");

  const [search, setSearch] = useState("");
  const [medQuery, setMedQuery] = useState("");
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [isMedicineListFocused, setIsMedicineListFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

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
    if (!selectedMed || !buyQty || !freeQty || !agreedRate) return;

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
          agreedRate,
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
        setAgreedRate("");
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

  const filteredMedicines = useMemo(() => {
    if (!search.trim()) return medicines;
    return medicines.filter((med) =>
      med.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [medicines, search]);

  return (
    <div className="p-2 w-full md:w-4/5 lg:w-3/4 space-y-2 flex flex-col items-center mx-auto">
      <div className="flex justify-between items-center w-full text-black">
        <h1 className="text-lg font-semibold">Latest Offers</h1>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Medcine"
          className="min-w-40 w-1/2 bg-white"
        />
        <Button onClick={() => setAddModalOpen(true)}>Add Offer</Button>
      </div>

      <hr className="w-full border-gray-400 my-1" />

      {/* Offers List */}
      <div className="space-y-1 w-full">
        <div className="bg-black text-white p-2 rounded-lg text-sm grid grid-cols-6 items-center">
          <span className="col-span-2">Medicine</span>
          <span>Offer</span>
          <span>Agreed Rate</span>
          <span>Date</span>
          <span className="text-center px-2">History</span>
        </div>
        {filteredMedicines.map((med) => {
          const latestOffer = med.offers?.[0];
          return (
            <div
              key={med._id}
              className="border p-2 rounded-lg shadow-sm grid grid-cols-6 items-center bg-white text-black"
            >
              <div className="font-medium col-span-2">{med.name}</div>
              {latestOffer ? (
                <>
                  <div className="text-sm">
                    {latestOffer.buyingQty + " + " + latestOffer.offerQty}
                  </div>
                  <div className="text-sm">{latestOffer.agreedRate || "-"}</div>
                  <div className="text-sm">
                    {format(
                      new Date(latestOffer.createdAt),
                      "dd/MM/yy | HH:mm"
                    )}
                  </div>
                </>
              ) : (
                <div className="text-sm">No current offer</div>
              )}
              <Button
                variant="link"
                disabled={med.offers?.length <= 1}
                onClick={() => {
                  setSelectedOffers(med);
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
            <DialogDescription>{selectedOffers.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="bg-black text-white p-2 rounded-lg text-sm grid grid-cols-3 items-center">
              <span>Offer</span>
              <span>Agreed Rate</span>
              <span className="text-right px-2">Date</span>
            </div>
            {selectedOffers?.offers?.map((offer, i) => (
              <div
                key={i}
                className="border p-2 rounded text-sm grid grid-cols-3 items-center"
              >
                <span>{offer.buyingQty + " + " + offer.offerQty}</span>
                <span>{offer.agreedRate || "-"}</span>
                <span className="text-right">
                  {format(new Date(offer.createdAt), "dd/MM/yy | HH:mm")}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md text-black">
          <DialogHeader>
            <DialogTitle>Add New Offer</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
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
                    <CommandList className="absolute bg-gray-300 rounded-lg max-h-52 top-12 left-0 my-1 w-full z-50">
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
                  step={0.1}
                  placeholder="Buy Qty"
                  value={buyQty}
                  onChange={(e) => setBuyQty(parseFloat(e.target.value))}
                  className="bg-white"
                />
                <Input
                  type="number"
                  step={0.1}
                  placeholder="Free Qty"
                  value={freeQty}
                  onChange={(e) => setFreeQty(parseFloat(e.target.value))}
                  className="bg-white"
                />
                <Input
                  value={agreedRate}
                  onChange={(e) => setAgreedRate(parseFloat(e.target.value))}
                  step={0.01}
                  placeholder="Agreed Rate"
                  type="number"
                  className="bg-white"
                />
                <Button onClick={handleAddOffer} disabled={submitting}>
                  {submitting ? "Adding..." : "Add Offer"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StockOffers;
// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// export default function OffersPage() {
//   const [medicines, setMedicines] = useState([]);
//   const [historyModal, setHistoryModal] = useState({
//     open: false,
//     offers: [],
//     medName: "",
//   });
//   const [addModalOpen, setAddModalOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const [results, setResults] = useState([]);
//   const [form, setForm] = useState({
//     medId: "",
//     buyingQty: "",
//     offerQty: "",
//     agreedRate: "",
//   });

//   // Fetch medicines with offers
//   const loadMedicines = () => {
//     fetch("/api/newMedicine/stockOffers")
//       .then((res) => res.json())
//       .then((data) => setMedicines(data.medicines));
//   };

//   useEffect(() => {
//     loadMedicines();
//   }, []);

//   const searchMedicines = (name) => {
//     setSearch(name);
//     if (name.length > 2) {
//       fetch(`/api/searchMedicine`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           query: name,
//         }),
//       })
//         .then((res) => res.json())
//         .then((data) => setResults(data.medicines));
//     }
//   };

//   const handleSubmit = async () => {
//     await fetch("/api/add-offer", {
//       method: "POST",
//       body: JSON.stringify(form),
//       headers: { "Content-Type": "application/json" },
//     });
//     let result = await fetch(`/api/newMedicine/stockOffers`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(form),
//     });
//     setAddModalOpen(false);
//     setForm({ medId: "", buyingQty: "", offerQty: "", agreedRate: "" });
//     loadMedicines();
//   };

//   return (
//     <div className="p-6 space-y-4 text-black">
// <div className="flex justify-between items-center">
//   <h1 className="text-lg font-semibold">Latest Offers</h1>
//   <Button onClick={() => setAddModalOpen(true)}>Add Offer</Button>
// </div>

//       {/* Offers Table */}
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Medicine</TableHead>
//             <TableHead>Buying Qty</TableHead>
//             <TableHead>Offer Qty</TableHead>
//             <TableHead>Agreed Rate</TableHead>
//             <TableHead>Action</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {medicines.map((med) => {
//             const latest = med.offers[0];
//             return (
//               <TableRow key={med._id}>
//                 <TableCell>{med.name}</TableCell>
//                 <TableCell>{latest.buyingQty}</TableCell>
//                 <TableCell>{latest.offerQty}</TableCell>
//                 <TableCell>₹{latest.agreedRate ?? "-"}</TableCell>
//                 <TableCell>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() =>
//                       setHistoryModal({
//                         open: true,
//                         offers: med.offers,
//                         medName: med.name,
//                       })
//                     }
//                   >
//                     View History
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             );
//           })}
//         </TableBody>
//       </Table>

//       {/* History Modal */}
//       <Dialog
//         open={historyModal.open}
//         onOpenChange={(o) => setHistoryModal({ ...historyModal, open: o })}
//       >
//         <DialogContent className="max-w-lg text-black">
//           <DialogHeader>
//             <DialogTitle>{historyModal.medName} - Past Offers</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-2">
//             {historyModal.offers.slice(1).length === 0 ? (
//               <p className="text-sm text-muted-foreground">No past offers</p>
//             ) : (
//               historyModal.offers.slice(1).map((offer, idx) => (
//                 <div key={idx} className="border rounded p-2 text-sm">
//                   <div>Buying Qty: {offer.buyingQty}</div>
//                   <div>Offer Qty: {offer.offerQty}</div>
//                   <div>Agreed Rate: ₹{offer.agreedRate ?? "-"}</div>
//                   <div>
//                     Date: {new Date(offer.createdAt).toLocaleDateString()}
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Add Offer Modal */}

//     </div>
//   );
// }
