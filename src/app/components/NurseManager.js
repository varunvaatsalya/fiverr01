"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showError } from "../utils/toast";

export default function NurseManager() {
  const [nurses, setNurses] = useState([]);
  const [newNurse, setNewNurse] = useState("");

  useEffect(() => {
    fetch("/api/nursesList")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNurses(data.nurses);
        }
      });
  }, []);

  const addNurse = async () => {
    if (!newNurse.trim()) return;
    const res = await fetch("/api/nursesList", {
      method: "POST",
      body: JSON.stringify({ name: newNurse }),
    });
    const data = await res.json();
    if (data.success) {
      setNurses([data.nurse, ...nurses]);
      setNewNurse("");
    } else showError(data.message);
  };

  const updateNurse = async (id, name) => {
    const res = await fetch("/api/nursesList", {
      method: "PUT",
      body: JSON.stringify({ id, name }),
    });
    const data = await res.json();
    if (data.success) {
      setNurses((prev) =>
        prev.map((n) => (n._id === data.updated._id ? data.updated : n))
      );
    } else showError(data.message);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Enter Nurse Name"
          value={newNurse}
          onChange={(e) => setNewNurse(e.target.value)}
          className="w-64"
        />
        <Button onClick={addNurse}>Add</Button>
      </div>

      {/* List + Edit */}
      <div className="space-y-2">
        {nurses.map((nurse, idx) => (
          <div key={nurse._id} className="flex gap-2 items-center">
            <Input
              value={nurse.name}
              onChange={(e) => {
                const updated = [...nurses];
                updated[idx].name = e.target.value;
                setNurses(updated);
              }}
              onBlur={() => updateNurse(nurse._id, nurse.name)}
              className="w-64"
            />
            <span className="text-gray-400 text-sm">
              ID: {nurse._id.slice(-5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
