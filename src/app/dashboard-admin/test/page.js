"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { GrHistory } from "react-icons/gr";
import { CiSearch } from "react-icons/ci";

export default function MedicineInvoice() {
  const [query, setQuery] = useState("");
  const [medQuery, setMedQuery] = useState("");
  const [patientOptions, setPatientOptions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [isMedicineListFocused, setIsMedicineListFocused] = useState(false);
  const [recentPatients, setRecentPatients] = useState([]);
  const [isPatientListFocused, setIsPatientListFocused] = useState(false);
  const [recentMedicines, setRecentMedicine] = useState([]);

  useEffect(() => {
    let recentSellMedicines = async () => {
      try {
        let result = await fetch(`/api/searchMedicine/recentSoldMedicines`);
        result = await result.json();
        if (result.success && result.medicines) {
          setRecentMedicine(result.medicines);
          setMedicineOptions(result.medicines);
          console.log(result);
        } else {
          console.error("Failed to fetch top sold medicines", result.message);
        }
      } catch (err) {
        console.error("Error fetching top sold medicines:", err);
      }
    };
    let recentPatinets = async () => {
      try {
        let result = await fetch(`/api/searchPatient`);
        result = await result.json();
        if (result.success && result.patients) {
          setRecentPatients(result.patients);
          setPatientOptions(result.patients);
          console.log(result);
        } else {
          console.error("Failed to fetch top sold medicines", result.message);
        }
      } catch (err) {
        console.error("Error fetching top sold medicines:", err);
      }
    };
    recentSellMedicines();
    recentPatinets();
  }, []);

  // Patient search with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query) {
        if (recentPatients.length > 0) setPatientOptions(recentPatients);
        return;
      }
      try {
        let result = await fetch(`/api/searchPatient`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
          }),
        });
        result = await result.json();

        if (result.success) {
          setPatientOptions(result.patients);
          console.log(result.patients);
        } else {
          console.error("Failed to fetch patients", result.message);
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Medicine search with debounce
  useEffect(() => {
    const medTimer = setTimeout(async () => {
      if (!medQuery) {
        if (recentMedicines.length > 0) setMedicineOptions(recentMedicines);
        console.log(recentMedicines);
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
          console.log(result.medicines);
        }
      } catch (err) {
        console.error("Error fetching medicines:", err);
      }
    }, 350);
    return () => clearTimeout(medTimer);
  }, [medQuery]);

  return (
    <div className="p-4 space-y-6">
      {!selectedPatient ? (
        <div>
          <p className="font-semibold mb-2">Search Patient</p>
          <Command className="mt-1 mb-4 block px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out">
            <CommandInput
              placeholder="Search Patient..."
              onFocus={() => setIsPatientListFocused(true)}
              onBlur={() =>
                setTimeout(() => setIsPatientListFocused(false), 250)
              }
              onValueChange={(value) => {
                setQuery(value);
              }}
            />
            {isPatientListFocused && (
              <CommandList>
                {patientOptions.map((p) => (
                  <CommandItem
                    key={p._id}
                    value={p.name}
                    onSelect={() => {
                      setSelectedPatient(p);
                      setPatientOptions([]);
                    }}
                  >
                    <span className="text-lg">
                      {query.trim() ? <CiSearch /> : <GrHistory />}
                    </span>
                    <span className="truncate">{p.name}</span>
                  </CommandItem>
                ))}
              </CommandList>
            )}
          </Command>
        </div>
      ) : (
        <>
          <Card className="mb-4">
            <CardContent className="flex justify-between items-center p-3">
              <div>
                <p className="font-semibold">{selectedPatient.name}</p>
                <p className="text-sm text-muted-foreground">
                  UHID: {selectedPatient.uhid}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setSelectedPatient(null)}
              >
                Change Patient
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <div>
        <p className="font-semibold mb-2">Search & Select Medicines</p>
        <Command className="bg-white border rounded-md">
          <CommandInput
            placeholder="Search Medicine..."
            onFocus={() => setIsMedicineListFocused(true)}
            onBlur={() =>
              setTimeout(() => setIsMedicineListFocused(false), 250)
            }
            onValueChange={(value) => {
              setMedQuery(value);
            }}
          />
          {isMedicineListFocused && (
            <>
              <CommandList>
                {medicineOptions.map((m) => {
                  const alreadySelected = selectedMedicines.some(
                    (med) => med._id === m._id
                  );

                  return (
                    <CommandItem
                      key={m._id}
                      value={m.name}
                      onSelect={() => {
                        if (!alreadySelected) {
                          setSelectedMedicines((prev) => [...prev, m]);
                        }
                      }}
                      className="flex items-center gap-2 px-2 py-1"
                    >
                      <span className="text-lg">
                        {medQuery.trim() ? <CiSearch /> : <GrHistory />}
                      </span>
                      <span className="truncate">{m.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandList>
            </>
          )}
        </Command>
      </div>
      {/* Selected Medicines */}
      {selectedMedicines.length > 0 && (
        <div>
          <p className="font-semibold mb-2">Selected Medicines</p>
          <div className="space-y-2">
            {selectedMedicines.map((m) => (
              <Card key={m._id}>
                <CardContent className="flex justify-between items-center p-3">
                  <div>
                    {m.name} ({m.strength})
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setSelectedMedicines((prev) =>
                        prev.filter((med) => med._id !== m._id)
                      )
                    }
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
