"use client";
import React, { useEffect, useState } from "react";
import NurseManager from "./NurseManager";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RxCross2 } from "react-icons/rx";
import { IoArrowForward } from "react-icons/io5";
import { GrHistory } from "react-icons/gr";
import { CiSearch } from "react-icons/ci";
import { showError } from "../utils/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function HospitalPharmacyInvoice() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [rows, setRows] = useState([{ patient: null, medicines: [] }]);
  const [nurses, setNurses] = useState([]);
  const [isOpenNurseSection, setIsOpenNurseSection] = useState(false);
  const [medicines, setMedicines] = useState([]);

  const [query, setQuery] = useState("");

  const [recentPatients, setRecentPatients] = useState([]);
  const [patients, setPatientOptions] = useState([]);
  const [openPatient, setOpenPatient] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState("");
  const [selectedMode, setSelectedMode] = useState("opd");

  useEffect(() => {
    async function fetchNurses() {
      try {
        let result = await fetch("/api/nursesList");
        result = await result.json();
        if (result.success) {
          setNurses(result.nurses || []);
        }
      } catch (err) {
        console.log("error: ", err);
        showError("Error in fetching nurses data!");
      }
    }
    async function fetchData() {
      try {
        let result = await fetch(`/api/newHospitalPharmacyInvoice?info=1`);
        result = await result.json();
        if (result.success) {
          setPatientOptions(result.patientsList);
          setRecentPatients(result.patientsList);
          setMedicines(result.medicinesList);
        } else {
          showError(result.message);
        }
      } catch (err) {
        console.log("error: ", err);
        showError("Error in fetching basic data!");
      }
    }
    fetchData();
    fetchNurses();
  }, []);

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

  const [medicineRecords, setMedicineRecords] = useState([]); // Final data for backend
  const [openMedicineId, setOpenMedicineId] = useState(null);
  const [tempEntries, setTempEntries] = useState([]);

  const handleAddEntry = () => {
    setTempEntries([...tempEntries, { patientId: "", quantity: "" }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...tempEntries];
    updated[index][field] = value;
    setTempEntries(updated);
  };

  const handleSubmitEntries = () => {
    setMedicineRecords((prev) => [
      ...prev,
      {
        medicineId: openMedicineId,
        givenTo: tempEntries,
      },
    ]);
    setOpenMedicineId(null);
    setTempEntries([]); // Reset after submission
    console.log("Saved Records:", medicineRecords);
  };

  const handleSubmit = () => {
  //   try {
  //     if (!date) throw new Error("Set the Invoice date!");
  //     const payload = rows.map((row) => {
  //       if (
  //         !row.patient._id ||
  //         !row.time ||
  //         !row.nurse ||
  //         row.medicines.length === 0
  //       ) {
  //         throw new Error("Fill all the fields properly!");
  //       }
  //       return {
  //         ...row,
  //         patient: row.patient._id,
  //         date,
  //       };
  //     });
  //     console.log("Submitting:", payload);
  //     // send payload to API here
  //     setOpen(false);
  //     setRows([{ patient: null, medicines: [] }]);
  //     setDate("");
  //   } catch (error) {
  //     showError(error.message);
  //     return;
  //   }
  };

  return (
    <>
      <div className="flex justify-between items-center gap-2 p-2">
        <Input
          placeholder="Search by patient"
          className="w- fulll md:w-1/2 lg:w-1/4 rounded-lg"
        />
        <Button onClick={() => setOpen(true)}>Add New</Button>
      </div>
      <div className="flex-grow w-full overflow-y-auto"></div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-screen-xl max-h-[90vh] overflow-y-auto text-gray-900">
          <DialogHeader>
            <DialogTitle>Batch Medicine Entry</DialogTitle>
          </DialogHeader>

          {/* Top Common Section */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <Select value={selectedNurse} onValueChange={setSelectedNurse}>
              <SelectTrigger className="border rounded-md px-2 py-2">
                <SelectValue placeholder="Select Nurse" />
              </SelectTrigger>
              <SelectContent>
                {nurses.map((nurse) => (
                  <SelectItem key={nurse._id} value={nurse.name}>
                    {nurse.name}
                  </SelectItem>
                ))}
                <SelectItem value={"others"}>{"others"}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedMode}
              onValueChange={(val) => setSelectedMode(val)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opd">OPD</SelectItem>
                <SelectItem value="ipd">IPD</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              onClick={() => setIsOpenNurseSection(!isOpenNurseSection)}
              className="text-red-500"
            >
              Add Nurse
            </Button>
          </div>

          {/* Table Style Input Section */}
          <div className="overflow-y-auto border rounded-md">
            <div className="space-y-4">
              {medicines.map((medicine) => (
                <div
                  key={medicine._id}
                  className="flex justify-between items-center border p-4 rounded-md"
                >
                  <div>{medicine.name}</div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setOpenMedicineId(medicine._id);
                          setTempEntries([{ patientId: "", quantity: "" }]);
                        }}
                      >
                        Give to Patients
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Give {medicine.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {tempEntries.map((entry, index) => (
                          <div key={index} className="flex gap-2 items-end">
                            <div className="flex-1">
                              <Label>Patient</Label>
                              <Select
                                onValueChange={(val) =>
                                  handleChange(index, "patientId", val)
                                }
                                value={entry.patientId}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select patient" />
                                </SelectTrigger>
                                <SelectContent>
                                  {patients.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Qty</Label>
                              <Input
                                type="number"
                                value={entry.quantity}
                                onChange={(e) =>
                                  handleChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" onClick={handleAddEntry}>
                          + Add Patient
                        </Button>
                        <Button onClick={handleSubmitEntries}>
                          Submit All
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}

              {/* Debug / Final Output */}
              <div className="mt-6">
                <h2 className="font-bold">Final JSON (for backend):</h2>
                <pre className="bg-gray-100 p-4 rounded text-sm">
                  {JSON.stringify(medicineRecords, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-end">
            <Button type="button" onClick={handleSubmit}>
              Submit All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isOpenNurseSection} onOpenChange={setIsOpenNurseSection}>
        <DialogContent className="overflow-y-auto text-gray-900">
          <DialogHeader>
            <DialogTitle>Nurse Maneger</DialogTitle>
          </DialogHeader>
          {<NurseManager />}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default HospitalPharmacyInvoice;

function MedicineMultiSelect({ value = [], onChange, setMedicineSection }) {
  const [medQuery, setMedQuery] = useState("");
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState(value || []);

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
          console.log(result.medicines);
        }
      } catch (err) {
        console.error("Error fetching medicines:", err);
      }
    }, 350);
    return () => clearTimeout(medTimer);
  }, [medQuery]);

  const handleSelect = (medicine) => {
    const exists = selectedMedicines.find((item) => item._id === medicine._id);
    console.log(medicine);
    if (!exists) {
      const newEntry = {
        _id: medicine._id,
        name: medicine.name,
        isTablets: medicine.isTablets,
        strips: "",
        tablets: "",
        quantity: "",
      };
      setSelectedMedicines([...selectedMedicines, newEntry]);
    }
    setOpen(false);
    setMedicineOptions([]);
  };

  const handleInputChange = (index, field, fieldValue) => {
    const updated = [...selectedMedicines];
    updated[index][field] = fieldValue;
    setSelectedMedicines(updated);
  };

  const handleRemove = (index) => {
    const updated = [...selectedMedicines];
    updated.splice(index, 1);
    setSelectedMedicines(updated);
  };

  function handleSave() {
    try {
      const parsed = selectedMedicines.map((med) => {
        const newMed = { ...med };

        if (med.isTablets) {
          const strips = Number(med.strips);
          const tablets = Number(med.tablets);

          const hasStrips = !isNaN(strips) && strips > 0;
          const hasTablets = !isNaN(tablets) && tablets > 0;

          if (!hasStrips && !hasTablets) {
            throw new Error(
              `Medicine "${med.name}" needs strips or tablets filled.`
            );
          }

          newMed.strips = hasStrips ? strips : 0;
          newMed.tablets = hasTablets ? tablets : 0;
          newMed.quantity = 0;
        } else {
          const quantity = Number(med.quantity);
          const validQuantity = !isNaN(quantity) && quantity > 0;

          if (!validQuantity) {
            throw new Error(`Medicine "${med.name}" needs a valid quantity.`);
          }

          newMed.quantity = validQuantity ? quantity : 0;
          newMed.strips = 0;
          newMed.tablets = 0;
        }

        return newMed;
      });

      console.log("Saving parsed data:", parsed);
      onChange(parsed);
      setMedicineSection(false);
    } catch (error) {
      showError(error.message);
      return;
    }
  }

  return (
    <div className="space-y-2">
      <Popover open={open || medicineOptions.length > 0} onOpenChange={setOpen}>
        <Command className="space-y-1">
          <PopoverTrigger asChild>
            <CommandInput
              value={medQuery}
              onValueChange={(e) => {
                setMedQuery(e);
              }}
              placeholder="Search medicines..."
            />
          </PopoverTrigger>
          <PopoverContent className="p-2">
            <CommandList>
              {medicineOptions.length > 0 ? (
                medicineOptions.map((med) => (
                  <CommandItem key={med.id} onSelect={() => handleSelect(med)}>
                    {med.name}
                  </CommandItem>
                ))
              ) : (
                <div className="p-2">No medicines found.</div>
              )}
            </CommandList>
          </PopoverContent>
          <div className="space-y-1">
            {selectedMedicines.map((med, index) => (
              <div
                key={med.id}
                className="border p-2 rounded-md flex justify-between items-center gap-3"
              >
                <span className="font-medium flex-1 line-clamp-1 text-sm">
                  {med.name}
                </span>
                {med.isTablets ? (
                  <div className="flex gap-2">
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="Strips"
                        value={med.strips}
                        onChange={(e) =>
                          handleInputChange(index, "strips", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="Tablets"
                        value={med.tablets}
                        onChange={(e) =>
                          handleInputChange(index, "tablets", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={med.quantity}
                      onChange={(e) =>
                        handleInputChange(index, "quantity", e.target.value)
                      }
                    />
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex justify-end">
              <Button onClick={handleSave} variant="outline" size="sm">
                Submit
              </Button>
            </div>
          </div>
        </Command>
      </Popover>
    </div>
  );
}
