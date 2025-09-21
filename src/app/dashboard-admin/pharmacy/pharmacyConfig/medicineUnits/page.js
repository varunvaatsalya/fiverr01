"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/app/components/Navbar";
import { showError, showSuccess } from "@/app/utils/toast";

function Page() {
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState({
    level0: [],
    level1: [],
    level2: [],
  });

  const [newUnit, setNewUnit] = useState({
    level0: "",
    level1: "",
    level2: "",
  });

  // fetch existing units from API
  useEffect(() => {
    async function fetchUnits() {
      setLoading(true);
      try {
        let res = await fetch("/api/newMedicine/medicineUnits");
        res = await res.json();
        if (res.success) setUnits(res.units);
        else showError(res.message || "Failed to fetch units");
      } catch (err) {
        console.error("Error fetching units:", err);
        showError("Error fetching units");
      } finally {
        setLoading(false);
      }
    }
    fetchUnits();
  }, []);

  const addUnit = (level) => {
    const value = newUnit[level].trim().toLowerCase();
    if (!value) return;
    if (units[level].includes(value)) {
      showError("Unit already exists");
      return;
    }
    setUnits((prev) => ({
      ...prev,
      [level]: [...prev[level], value],
    }));
    setNewUnit((prev) => ({ ...prev, [level]: "" }));
  };

  const removeUnit = (level, index) => {
    setUnits((prev) => ({
      ...prev,
      [level]: prev[level].filter((_, i) => i !== index),
    }));
  };

  const saveUnits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/newMedicine/medicineUnits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(units),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(data.message || "Units saved successfully");
      } else {
        showError(data.message || "Failed to save units");
      }
    } catch (err) {
      console.error("Error saving units:", err);
      showError("Error saving units");
    } finally {
      setLoading(false);
    }
  };

  const renderUnitSection = (level, label) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="flex gap-2 mb-2"
          onSubmit={(e) => {
            e.preventDefault();
            addUnit(level);
          }}
        >
          <Input
            placeholder={`Add new ${label} unit`}
            value={newUnit[level]}
            onChange={(e) => {
              const value = e.target.value.toLowerCase().trimStart();
              setNewUnit((prev) => ({
                ...prev,
                [level]: value,
              }));
            }}
          />
          <Button type="submit">Add</Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {units[level].map((unit, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => removeUnit(level, idx)}
            >
              {unit} ✕
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <Navbar route={["Pharmacy", "Config", "Medicine Units"]} />
      <div className="p-2 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 px-2 text-black">Manage Medicine Units</h1>
        {renderUnitSection("level0", "Level 0 (Base Unit)")}
        {renderUnitSection("level1", "Level 1 (Intermediate Unit)")}
        {renderUnitSection("level2", "Level 2 (Top Unit)")}

        <Button disabled={loading} className="mt-3 w-full" onClick={saveUnits}>
          {loading ? "Wait..." : "Save All Units"}
        </Button>
      </div>
    </div>
  );
}

export default Page;
