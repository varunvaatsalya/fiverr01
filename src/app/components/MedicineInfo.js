"use client";
import React, { Fragment, useEffect, useMemo, useState } from "react";
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
import { showError, showSuccess } from "@/app/utils/toast";
import { FaEdit } from "react-icons/fa";
import { BadgeX } from "lucide-react";

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

  async function fetchData() {
    try {
      let encodedLetter = encodeURIComponent(selectedLetter);
      let result = await fetch(
        `/api/medicinesInfo?letter=${encodedLetter}${
          !metaData ? `&metaData=1` : ""
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

  useEffect(() => {
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
    if (!editMode) {
      showError("Enable Edit Mode, First!");
      return;
    }
    setEdited((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const deleteChanges = (medId) => {
    const updated = { ...edited };
    delete updated[medId];
    setEdited(updated);
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
        setEdited({});
        fetchData();
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
    <div className="p-2 bg-slate-100 text-black flex-1 min-h-0">
      <div className="flex flex-wrap gap-2 justify-center">
        {alphabets.map((char) => (
          <Button
            key={char}
            size="sm"
            variant={selectedLetter === char ? "default" : "outline"}
            onClick={() => {
              setSelectedLetter(char);
              setEdited({});
            }}
          >
            {char}
          </Button>
        ))}
        <Button
          size="sm"
          variant={selectedLetter === "#" ? "default" : "outline"}
          onClick={() => {
            setSelectedLetter("#");
            setEdited({});
          }}
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
          className="w-[200px] bg-white"
        />

        <Select
          onValueChange={(val) => setSelectedMfg(val === "all" ? "" : val)}
          value={selectedMfg}
        >
          <SelectTrigger className="w-[180px] bg-white">
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
          <SelectTrigger className="w-[180px] bg-white">
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

        <Button
          variant={editMode ? "default" : "outline"}
          onClick={() => {
            setEditMode((prev) => !prev);
            setEdited({});
          }}
        >
          {editMode ? "Disable Edit" : "Enable Edit"}
        </Button>

        {editMode && Object.keys(edited).length > 0 && (
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
              <TableHead className="w-8">Sr No.</TableHead>
              <TableHead className="w-40">Medicine</TableHead>
              <TableHead className="w-40">Manufacturer</TableHead>
              <TableHead className="w-40">Salts</TableHead>
              <TableHead className="w-24 text-center">IsTablets</TableHead>
              <TableHead className="w-32">Type</TableHead>
              <TableHead className="w-32 text-center">Min(G/R)</TableHead>
              <TableHead className="w-32 text-center">Max(G/R)</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="text-black">
            {filteredMeds.map((med, index) => {
              const editedMed = edited[med._id] || {};
              let status = editedMed.status ?? med.status ?? "active";

              return (
                <Fragment key={med._id}>
                  {/* -------- First Row: Medicine Info -------- */}
                  <TableRow className="bg-white hover:bg-white">
                    <TableCell className="w-8 text-center">
                      {index + 1 + "."}
                    </TableCell>
                    <TableCell className="w-40">
                      <input
                        type="text"
                        value={editedMed.name ?? med.name}
                        onChange={(e) =>
                          handleEditChange(med._id, "name", e.target.value)
                        }
                        // disabled={!editMode}
                        placeholder="Enter medicine name"
                        className="border px-2 py-1 rounded w-full"
                      />
                    </TableCell>

                    <TableCell className="w-40">
                      <select
                        value={editedMed.manufacturer ?? med.manufacturer._id}
                        onChange={(e) =>
                          handleEditChange(
                            med._id,
                            "manufacturer",
                            e.target.value
                          )
                        }
                        // disabled={!editMode}
                        className="bg-zinc-800 border border-zinc-600 text-white px-2 py-1 rounded w-full"
                      >
                        {metaData?.manufacturers.map((mfg) => (
                          <option key={mfg._id} value={mfg._id}>
                            {mfg.name}
                          </option>
                        ))}
                      </select>
                    </TableCell>

                    <TableCell className="w-40">
                      <select
                        value={editedMed.salts ?? med.salts._id}
                        onChange={(e) =>
                          handleEditChange(med._id, "salts", e.target.value)
                        }
                        // disabled={!editMode}
                        className="bg-zinc-800 border border-zinc-600 text-white px-2 py-1 rounded w-full"
                      >
                        {metaData?.salts.map((salt) => (
                          <option key={salt._id} value={salt._id}>
                            {salt.name}
                          </option>
                        ))}
                      </select>
                    </TableCell>

                    <TableCell className="w-24 text-center">
                      <input
                        type="checkbox"
                        checked={editedMed.isTablets ?? med.isTablets}
                        onChange={(e) =>
                          handleEditChange(
                            med._id,
                            "isTablets",
                            e.target.checked
                          )
                        }
                        // disabled={!editMode}
                        className="size-5 mx-auto"
                      />
                    </TableCell>

                    <TableCell className="w-32">
                      <input
                        type="text"
                        value={editedMed.medicineType ?? med.medicineType ?? ""}
                        onChange={(e) =>
                          handleEditChange(
                            med._id,
                            "medicineType",
                            e.target.value
                          )
                        }
                        placeholder="Enter medicine type"
                        // disabled={!editMode}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </TableCell>

                    <TableCell className="w-32 text-center">
                      {`${med.minimumStockCount?.godown || "-"}/${
                        med.minimumStockCount?.retails || "-"
                      }`}
                    </TableCell>

                    <TableCell className="w-32 text-center">
                      {`${med.maximumStockCount?.godown || "-"}/${
                        med.maximumStockCount?.retails || "-"
                      }`}
                    </TableCell>
                  </TableRow>

                  {/* -------- Second Row: Packet Size -------- */}
                  <TableRow className="bg-white hover:bg-white">
                    <TableCell colSpan={8}>
                      <div className="flex items-center gap-4 py-0.5">
                        {status === "disable" && (
                          <BadgeX className="text-red-600" />
                        )}
                        <div className="font-semibold">Status:</div>
                        <select
                          value={status}
                          onChange={(e) => {
                            const previousValue =
                              editedMed.status ?? med.status ?? "active";
                            const selectedValue = e.target.value;
                            const confirmed = window.confirm(
                              `Are you sure you want to change status from "${previousValue}" to "${selectedValue}"?`
                            );
                            if (!confirmed) {
                              e.target.value = previousValue;
                              return;
                            }
                            handleEditChange(med._id, "status", selectedValue);
                          }}
                          className="w-28 px-1 h-8 rounded-lg bg-gray-600 text-white"
                        >
                          <option value="active">Active</option>
                          <option value="disable">Disable</option>
                        </select>
                        <div className="font-semibold">Packet Size:</div>
                        {/* Box */}
                        <div className="flex gap-2 items-center px-2 py-1.5 bg-gray-100 rounded-lg border">
                          <span>1</span>
                          {/* <input
                            type="text"
                            value={
                              editedMed.unitLabels?.level2 ??
                              med.unitLabels?.level2 ??
                              "box"
                            }
                            onChange={(e) => {
                              const value =
                                e.target.value?.toLowerCase?.() || "";
                              handleEditChange(med._id, "unitLabels", {
                                ...med.unitLabels,
                                ...editedMed.unitLabels,
                                level2: value,
                              });
                            }}
                            // disabled={!editMode}
                            className="w-24 border px-2 py-1 rounded"
                          /> */}
                          <select
                            value={
                              editedMed.unitLabels?.level2 ??
                              med.unitLabels?.level2 ??
                              "box"
                            }
                            onChange={(e) => {
                              const value = e.target.value.toLowerCase();
                              handleEditChange(med._id, "unitLabels", {
                                ...med.unitLabels,
                                ...editedMed.unitLabels,
                                level2: value,
                              });
                            }}
                            disabled={!editMode}
                            className="w-40 border px-2 py-1 rounded"
                          >
                            <option value="box">box</option>
                            {(metaData?.units?.level2 || []).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>

                          <span>=</span>
                          <input
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
                            // disabled={!editMode}
                            className="w-16 border px-2 py-1 rounded"
                          />
                          {/* <input
                            type="text"
                            value={
                              editedMed.unitLabels?.level1 ??
                              med.unitLabels?.level1 ??
                              "pack"
                            }
                            onChange={(e) => {
                              const value =
                                e.target.value?.toLowerCase?.() || "";
                              handleEditChange(med._id, "unitLabels", {
                                ...med.unitLabels,
                                ...editedMed.unitLabels,
                                level1: value,
                              });
                            }}
                            // disabled={!editMode}
                            className="w-24 border px-2 py-1 rounded"
                          /> */}
                          <select
                            value={
                              editedMed.unitLabels?.level1 ??
                              med.unitLabels?.level1 ??
                              "pack"
                            }
                            onChange={(e) => {
                              const value = e.target.value.toLowerCase();
                              handleEditChange(med._id, "unitLabels", {
                                ...med.unitLabels,
                                ...editedMed.unitLabels,
                                level1: value,
                              });
                            }}
                            disabled={!editMode}
                            className="w-40 border px-2 py-1 rounded"
                          >
                            <option value="pack">pack</option>
                            {(metaData?.units?.level1 || []).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                        {(editedMed.isTablets ?? med.isTablets) && (
                          <div className="flex gap-2 items-center px-2 py-1.5 bg-gray-100 rounded-lg border">
                            <span>1</span>
                            <div>
                              {editedMed.unitLabels?.level1 ??
                                med.unitLabels?.level1 ??
                                "pack"}
                            </div>
                            <span>=</span>
                            <input
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
                              // disabled={!editMode}
                              className="w-16 border px-2 py-1 rounded"
                            />
                            {/* <input
                              type="text"
                              value={
                                editedMed.unitLabels?.level0 ??
                                med.unitLabels?.level0 ??
                                "unit"
                              }
                              onChange={(e) => {
                                const value =
                                  e.target.value?.toLowerCase?.() || "";
                                handleEditChange(med._id, "unitLabels", {
                                  ...med.unitLabels,
                                  ...editedMed.unitLabels,
                                  level0: value,
                                });
                              }}
                              // disabled={!editMode}
                              className="w-24 border px-2 py-1 rounded"
                            /> */}
                            <select
                              value={
                                editedMed.unitLabels?.level0 ??
                                med.unitLabels?.level0 ??
                                "unit"
                              }
                              onChange={(e) => {
                                const value = e.target.value.toLowerCase();
                                handleEditChange(med._id, "unitLabels", {
                                  ...med.unitLabels,
                                  ...editedMed.unitLabels,
                                  level0: value,
                                });
                              }}
                              disabled={!editMode}
                              className="w-40 border px-2 py-1 rounded"
                            >
                              <option value="unit">unit</option>
                              {(metaData?.units?.level0 || []).map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {Object.keys(editedMed).length > 0 && (
                          <>
                            <div className="flex gap-1 items-center bg-red-600 text-white rounded px-2 py-1">
                              <FaEdit className="size-4" />
                              <span className="font-semibold text-sm">
                                Edited
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              onClick={() => deleteChanges(med._id)}
                            >
                              Delete Changes
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent">
                    <td colSpan={10} className="h-4"></td>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default MedicineInfo;
