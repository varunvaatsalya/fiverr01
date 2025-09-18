"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { RxCross2 } from "react-icons/rx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

function AdvPharmacyInvoiceSearch({ setSearchedInvoices }) {
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchedLength, setSearchedLength] = useState(null);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [medicineStats, setMedicineStats] = useState([]);
  const [logic, setLogic] = useState("OR");

  const { register, handleSubmit, watch } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      let result = await fetch("/api/newPharmacyInvoice/advInvoiceSearch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          ...(selected.length > 0 ? { selected, logic } : {}),
        }),
      });
      result = await result.json();
      console.log("jsonParse2", result);
      if (result.success) {
        setSearchedInvoices(result.invoices);
        setSearchedLength(result.invoices.length);
        setMedicineStats(result.medicineStats);
      } else {
        setMessage(result.message);
        setTimeout(() => {
          setMessage("");
        }, 4500);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!search) return;
    const medTimer = setTimeout(async () => {
      try {
        let result = await fetch(`/api/searchMedicine`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: search,
          }),
        });
        result = await result.json();
        if (result.success) {
          setOptions(result.medicines);
        }
      } catch (err) {
        console.error("Error fetching medicines:", err);
      }
    }, 350);
    return () => clearTimeout(medTimer);
  }, [search]);

  const toggleSelection = (med) => {
    setSelected((prev) => {
      const exists = prev.find((m) => m._id === med._id);
      if (exists) return prev.filter((m) => m._id !== med._id);
      return [...prev, med];
    });
  };
  return (
    <div className=" px-3 py-6 border-t bg-slate-900 border-gray-800">
      <div className="flex flex-wrap gap-2 items-center">
        {searchedLength && (
          <div className="text-red-600 font-semibold">
            Total Count: {searchedLength}
          </div>
        )}
        {medicineStats.map((med, it) => (
          <div
            key={it}
            className="px-2 rounded bg-gray-800 text-white"
          >{`${med.name}, ${med.totalEquivalentStrips}`}</div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-wrap justify-center items-center gap-3"
      >
        {message && (
          <div className="my-1 w-full text-center text-red-500">{message}</div>
        )}
        <input
          id="inid"
          type="text"
          placeholder={"Invoice ID"}
          {...register("inid")}
          className="mt-1 block text-white w-48 px-4 py-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <input
          id="patient name"
          type="text"
          placeholder={"patient name"}
          {...register("patientName")}
          className="mt-1 block text-white w-48 px-4 py-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <input
          id="uhid"
          type="text"
          placeholder={"UHID"}
          {...register("uhid")}
          className="mt-1 block text-white w-48 px-4 py-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className="flex flex-col lg:flex-row justify-center items-center gap-x-2">
          <label
            htmlFor="sdate"
            className=" text-sm lg:text-base font-medium text-gray-100"
          >
            Start Date
          </label>
          <input
            id="sdate"
            type="datetime-local"
            {...register("startDate")}
            className="block text-white w-40 md:w-44 lg:w-48 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
          />
        </div>
        <div className="flex flex-col lg:flex-row justify-center items-center gap-x-2">
          <label
            htmlFor="edate"
            className=" text-sm lg:text-base font-medium text-gray-100"
          >
            End Date
          </label>
          <input
            id="edate"
            type="datetime-local"
            {...register("endDate")}
            className="block text-white w-40 md:w-44 lg:w-48 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
          />
        </div>
        <div className="flex flex-col lg:flex-row justify-center items-center gap-x-2">
          <label
            htmlFor="isReturn"
            className=" text-sm lg:text-base font-medium text-gray-100"
          >
            Return Invoices
          </label>
          <input
            id="isReturn"
            type="checkbox"
            checked={watch("isReturn")}
            {...register(`isReturn`)}
            className="size-6"
          />
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="px-2 bg-gray-700 hover:bg-gray-800 hover:text-white text-white"
              onClick={() => setOpen(true)}
            >
              {selected.length > 0
                ? `${selected.length} medicines selected`
                : "Select medicines"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-1 bg-gray-100 mt-1">
            <Input
              placeholder="Search medicines..."
              value={search}
              autoFocus
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full p-1"
            />
            <ScrollArea className="max-h-52 p-2">
              {options.map((med) => (
                <div key={med._id} className="flex items-center gap-2 py-1">
                  <Checkbox
                    checked={selected.some((s) => s._id === med._id)}
                    onCheckedChange={() => toggleSelection(med)}
                    id={med._id}
                  />
                  <Label htmlFor={med._id}>{med.name}</Label>
                </div>
              ))}
              {options.length === 0 && (
                <div className="text-sm text-gray-500 px-2 py-1">
                  No results
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selected.map((med) => (
              <div
                key={med._id}
                className="flex items-center bg-blue-100 text-blue-800 text-sm p-1 rounded"
              >
                {med.name}
                <button
                  onClick={() => toggleSelection(med)}
                  className="ml-1 hover:text-red-500"
                >
                  <RxCross2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1">
          <Label className="mb-1 block">Logic</Label>
          <Select value={logic} onValueChange={(v) => setLogic(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select logic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OR">OR – any medicine</SelectItem>
              <SelectItem value="AND">AND – all medicines</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <select
          id="paymentMode"
          {...register("paymentMode")}
          className="mt-1 block px-4 py-3 text-white w-48 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">-- Payment Mode --</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Card">Card</option>
          <option value="mixed">Mixed</option>
          <option value="Credit-Insurance">{"Credit (Insurance)"}</option>
          <option value="Credit-Doctor">{"Credit (Doctor)"}</option>
          <option value="Credit-Society">{"Credit (Society)"}</option>
          <option value="Credit-Others">{"Credit (Others)"}</option>
        </select>
        <button
          type="submit"
          className="px-3 py-1 flex items-center justify-center gap-2 bg-blue-500 rounded-lg font-semibold cursor-pointer text-white"
        >
          {submitting ? "Searching..." : "Search"}
        </button>
      </form>
    </div>
  );
}

export default AdvPharmacyInvoiceSearch;
