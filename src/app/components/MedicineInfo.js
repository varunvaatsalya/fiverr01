"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { showError, showSuccess } from "@/app/utils/toast";

const alphabets = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
function MedicineInfo() {
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [medicines, setMedicines] = useState([]);
  const [metaData, setMetaData] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedMfg, setSelectedMfg] = useState("");
  const [selectedSalt, setSelectedSalt] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [edited, setEdited] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch(
          `/api/medicinesInfo?letter=${selectedLetter}${
            metaData ? `&metaData=1` : ""
          }`
        );
        result = await result.json();
        if (result.success) {
          setMedicines(result.medicines);
          if (result.medicinesMetaInfo) setMetaData(result.medicinesMetaInfo);
        } else {
          setMessage(result.message);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, [selectedLetter]);

  const filteredMeds = useMemo(() => {
    return medicines.filter((med) => {
      const name = med.name?.toLowerCase() || "";
      const startsWith =
        selectedLetter === "#"
          ? !alphabets.includes(name[0]?.toUpperCase())
          : name.startsWith(selectedLetter.toLowerCase());

      const matchesSearch = name.includes(search.toLowerCase());
      const matchesMfg = selectedMfg
        ? med.manufacturer._id === selectedMfg
        : true;
      const matchesSalt = selectedSalt ? med.salts._id === selectedSalt : true;

      return startsWith && matchesSearch && matchesMfg && matchesSalt;
    });
  }, [medicines, selectedLetter, search, selectedMfg, selectedSalt]);

  const handleEditChange = (id, field, value) => {
    setEdited((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    const changed = Object.entries(edited).map(([id, updates]) => ({
      id,
      updates,
    }));
    if (changed.length === 0) {
      showError("No changes made to save.");
      return;
    }
    setSubmitting(true);
    try {
      let result = await fetch("/api/medicinesInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updatedMedicines: changed }),
      });

      result = await result.json();
      if (result.success) {
        showSuccess(`${result.modifiedCount} ${result.message}`);
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="p-2 bg-white text-black flex-1 min-h-0">
      <div className="flex flex-wrap gap-2 justify-center">
        {alphabets.map((char) => (
          <Button
            key={char}
            size="sm"
            variant={selectedLetter === char ? "default" : "outline"}
            onClick={() => setSelectedLetter(char)}
          >
            {char}
          </Button>
        ))}
        <Button
          size="sm"
          variant={selectedLetter === "#" ? "default" : "outline"}
          onClick={() => setSelectedLetter("#")}
        >
          #
        </Button>
      </div>
      {/* Filters & Controls */}
      <div className="flex flex-wrap items-center justify-center my-2 gap-4">
        <Input
          placeholder="Search medicine..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[200px]"
        />

        <Select
          onValueChange={(val) => setSelectedMfg(val === "all" ? "" : val)}
          value={selectedMfg}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Manufacturer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {metaData?.manufacturers.map((mfg) => (
              <SelectItem key={mfg._id} value={mfg._id}>
                {mfg.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(val) => setSelectedSalt(val === "all" ? "" : val)}
          value={selectedSalt}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Salt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {metaData?.salts.map((salt) => (
              <SelectItem key={salt._id} value={salt._id}>
                {salt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => setEditMode((prev) => !prev)}>
          {editMode ? "Disable Edit" : "Enable Edit"}
        </Button>

        {editMode && (
          <Button
            onClick={handleSave}
            disabled={submitting}
            className="bg-green-600 text-white"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>
      <div className="flex-1 w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Salts</TableHead>
              <TableHead>IsTablets</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Packet Size</TableHead>
              <TableHead>Min(G/R)</TableHead>
              <TableHead>Max(G/R)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-black">
            {filteredMeds.map((med) => {
              const editedMed = edited[med._id] || {};

              return (
                <TableRow key={med._id}>
                  {/* Medicine Name */}
                  <TableCell>
                    <Input
                      value={editedMed.name ?? med.name}
                      onChange={(e) =>
                        handleEditChange(med._id, "name", e.target.value)
                      }
                      disabled={!editMode}
                    />
                  </TableCell>

                  {/* Manufacturer Dropdown */}
                  <TableCell>
                    <select
                      value={editedMed.manufacturer ?? med.manufacturer._id}
                      onChange={(e) =>
                        handleEditChange(
                          med._id,
                          "manufacturer",
                          e.target.value
                        )
                      }
                      disabled={!editMode}
                      className="bg-zinc-800 border border-zinc-600 text-white px-2 py-1 rounded w-full"
                    >
                      {metaData?.manufacturers.map((mfg) => (
                        <option key={mfg._id} value={mfg._id}>
                          {mfg.name}
                        </option>
                      ))}
                    </select>
                  </TableCell>

                  {/* Salt Dropdown */}
                  <TableCell>
                    <select
                      value={editedMed.salts ?? med.salts._id}
                      onChange={(e) =>
                        handleEditChange(med._id, "salts", e.target.value)
                      }
                      disabled={!editMode}
                      className="bg-zinc-800 border border-zinc-600 text-white px-2 py-1 rounded w-full"
                    >
                      {metaData?.salts.map((salt) => (
                        <option key={salt._id} value={salt._id}>
                          {salt.name}
                        </option>
                      ))}
                    </select>
                  </TableCell>

                  {/* isTablets Toggle */}
                  <TableCell className="px-2">
                    <Checkbox
                      checked={editedMed.isTablets ?? med.isTablets}
                      onCheckedChange={(checked) =>
                        handleEditChange(med._id, "isTablets", checked)
                      }
                      disabled={!editMode}
                      className="bg-zinc-800 border border-zinc-600 text-white size-5 mx-auto rounded"
                    />
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    <Input
                      value={editedMed.medicineType ?? med.medicineType ?? ""}
                      onChange={(e) =>
                        handleEditChange(
                          med._id,
                          "medicineType",
                          e.target.value
                        )
                      }
                      disabled={!editMode}
                    />
                  </TableCell>

                  {/* Packet Size (strips + tabletsPerStrip) */}
                  <TableCell>
                    {med.isTablets ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={
                            editedMed.packetSize?.strips ??
                            med.packetSize?.strips ??
                            0
                          }
                          onChange={(e) =>
                            handleEditChange(med._id, "packetSize", {
                              ...med.packetSize,
                              ...editedMed.packetSize,
                              strips: Number(e.target.value),
                            })
                          }
                          disabled={!editMode}
                          className="w-20"
                          placeholder="Strips"
                        />
                        <span className="text-black">x</span>
                        <Input
                          type="number"
                          value={
                            editedMed.packetSize?.tabletsPerStrip ??
                            med.packetSize?.tabletsPerStrip ??
                            0
                          }
                          onChange={(e) =>
                            handleEditChange(med._id, "packetSize", {
                              ...med.packetSize,
                              ...editedMed.packetSize,
                              tabletsPerStrip: Number(e.target.value),
                            })
                          }
                          disabled={!editMode}
                          className="w-24"
                          placeholder="Tabs/Strip"
                        />
                      </div>
                    ) : (
                      <Input
                        type="number"
                        value={
                          editedMed.packetSize?.strips ?? med.packetSize?.strips
                        }
                        onChange={(e) =>
                          handleEditChange(med._id, "packetSize", {
                            strips: Number(e.target.value),
                          })
                        }
                        disabled={!editMode}
                        className="w-24"
                        placeholder="Units"
                      />
                    )}
                  </TableCell>
                  <TableCell>{`${med.minimumStockCount?.godown || "-"}/${
                    med.minimumStockCount?.retails || "-"
                  }`}</TableCell>
                  <TableCell>{`${med.maximumStockCount?.godown || "-"}/${
                    med.maximumStockCount?.retails || "-"
                  }`}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default MedicineInfo;
