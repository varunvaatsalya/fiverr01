"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Loading from "./Loading";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { GrHistory } from "react-icons/gr";
import { CiSearch } from "react-icons/ci";
import { showError } from "../utils/toast";

const NewDataEntryForm = ({ setNewUserSection, setEntity }) => {
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState(null);

  const { register, handleSubmit, setValue } = useForm();

  const [query, setQuery] = useState("");
  const [isPatientListFocused, setIsPatientListFocused] = useState(false);
  const [recentPatients, setRecentPatients] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deptOpen, setDeptOpen] = useState(true);
  const [docOpen, setDocOpen] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [itemsOpen, setItemsOpen] = useState(false);

  useEffect(() => {
    setValue("items", selectedItems);
  }, [selectedItems]);

  useEffect(() => {
    setSelectedItems([]);
  }, [selectedDepartment]);

  useEffect(() => {
    if (details?.departments && selectedDepartment) {
      const department = details.departments.find(
        (department) => department._id === selectedDepartment
      );
      if (department) {
        setAvailableItems(
          department.items.sort((a, b) => a.name.localeCompare(b.name))
        );
      }
    }
  }, [selectedDepartment, details]);

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
        } else {
          console.error("Failed to fetch patients", result.message);
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newPrescription?componentDetails=1");
        result = await result.json();
        if (result.success) {
          setDetails({
            doctors: result.doctors,
            departments: result.departments,
          });
          setPatientOptions(result.patients || []);
          setRecentPatients(result.patients || []);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    if (
      selectedItems.length <= 0 ||
      !selectedPatient ||
      !selectedDepartment ||
      !selectedDoctor
    ) {
      showError("fill the details properly");
      return;
    }
    setSubmitting(true);
    try {
      console.log(data, selectedItems.length);
      let result = await fetch("/api/newDataEntry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      result = await result.json();
      if (result.success) {
        setEntity((prevDataEntry) => [...prevDataEntry, result.newDataEntry]);
        setNewUserSection((prev) => !prev);
      } else {
        showError(result.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle item selection via checkbox
  const handleItemSelection = (item, isChecked) => {
    if (isChecked) {
      setSelectedItems([...selectedItems, item]); // Add item to selected items
    } else {
      setSelectedItems(
        selectedItems.filter((selectedItem) => selectedItem.name !== item.name)
      ); // Remove item by name
    }
  };

  const filteredDoctors = details?.doctors.filter(
    (doctor) => doctor.department === selectedDepartment
  );

  if (!details)
    return (
      <div className="p-4 flex justify-center">
        <Loading size={50} />
      </div>
    );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-[90%] min-h-[60vh] md:w-4/5 max-h-[80vh] flex flex-col items-center overflow-auto mx-auto px-2 my-2"
    >
      {/* Department Selection */}
      <h2 className="font-bold text-2xl text-white">
        New <span className="text-blue-500">Desk Entry</span>
      </h2>
      <hr className="border border-slate-800 w-full my-2" />
      <div className="flex-grow text-white w-full ">
        {selectedPatient ? (
          <div className="w-full flex flex-wrap justify-around gap-2 my-2">
            <div className="font-semibold">
              Pateint:{" "}
              <span className="text-blue-500 uppercase">
                {selectedPatient?.name}
              </span>
            </div>
            <div className="font-semibold">
              UHID:{" "}
              <span className="text-blue-500 uppercase">
                {selectedPatient?.uhid}
              </span>
            </div>
            <button
              className="px-2 py-1 text-red-500 hover:text-red-700 text-sm rounded-lg font-semibold"
              onClick={() => {
                setSelectedPatient(null);
              }}
            >
              Change Patient
            </button>
          </div>
        ) : (
          <div className="relative w-full">
            <Command className="mb-2 px-3 py-1 text-white bg-gray-800 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out">
              <CommandInput
                placeholder="Search Patient..."
                autoFocus
                onFocus={() => setIsPatientListFocused(true)}
                onBlur={() =>
                  setTimeout(() => setIsPatientListFocused(false), 250)
                }
                onValueChange={(value) => {
                  setQuery(value);
                }}
              />
              {isPatientListFocused && (
                <CommandList className="absolute bg-gray-800 rounded-lg max-h-48 top-12 left-0 my-1 w-full z-50">
                  {patientOptions.map((p) => (
                    <CommandItem
                      key={p._id}
                      value={`${p.name} (UHID: ${p.uhid})`}
                      onSelect={() => {
                        setSelectedPatient(p);
                        setValue("patient", p._id);
                      }}
                    >
                      <span className="text-lg">
                        {query.trim() ? <CiSearch /> : <GrHistory />}
                      </span>
                      <span className="truncate">{`${p.name} (UHID: ${p.uhid})`}</span>
                    </CommandItem>
                  ))}
                </CommandList>
              )}
            </Command>
          </div>
        )}
        {/* {selectedPatient && (
          <select
            id="department"
            {...register("department", { required: "department is required" })}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
            }}
            className="mt-1 mb-4 block px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
          >
            <option value="">-- Select a Department --</option>
            {details.departments.map((department, index) => (
              <option key={index} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
        )} */}

        {selectedPatient && (
          <Popover open={deptOpen} onOpenChange={setDeptOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "w-full mt-1 mb-2 px-4 py-3 text-left bg-gray-700 text-white rounded-xl shadow-sm",
                  !selectedDepartment && "text-gray-400"
                )}
              >
                {selectedDepartment
                  ? details.departments.find(
                      (department) => department._id === selectedDepartment
                    )?.name
                  : "Select department..."}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0 bg-gray-700 border-gray-500"
              side="bottom"
              align="start"
            >
              <Command className="bg-gray-700 text-white">
                <CommandInput placeholder="Search department..." />
                <CommandList>
                  <CommandEmpty>No department found.</CommandEmpty>
                  <CommandGroup>
                    {details.departments.map((department) => (
                      <CommandItem
                        className="text-white"
                        key={department._id}
                        value={department.name}
                        onSelect={() => {
                          setValue(
                            "department",
                            department._id === selectedDepartment
                              ? ""
                              : department._id
                          );
                          setSelectedDepartment(
                            department._id === selectedDepartment
                              ? ""
                              : department._id
                          );
                          setValue("doctor", "");
                          setSelectedDoctor("");
                          setDeptOpen(false);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedDepartment === department._id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {department.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {/* Display items if a department is selected */}
        {selectedDepartment && selectedPatient && (
          <>
            {/* <select
              id="doctor"
              {...register("doctor", { required: "doctor is required" })}
              className="mt-1 mb-4 block px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
            >
              <option value="">-- Select a Doctor --</option>
              {details.doctors
                .filter((doctor) => doctor.department === selectedDepartment)
                .map((doctor, index) => (
                  <option key={index} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
            </select> */}

            <div className="mb-2">
              <Popover open={docOpen} onOpenChange={setDocOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full px-4 py-3 text-left bg-gray-700 text-white rounded-xl shadow-sm",
                      !selectedDoctor && "text-gray-400"
                    )}
                  >
                    {selectedDoctor
                      ? filteredDoctors.find(
                          (doc) => doc._id === selectedDoctor
                        )?.name
                      : "-- Select a Doctor --"}
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  className="p-0 bg-gray-700 border-gray-500"
                  side="bottom"
                  align="start"
                >
                  <Command className="bg-gray-700 text-white">
                    <CommandInput placeholder="Search doctor..." />
                    <CommandList>
                      <CommandEmpty>No doctor found.</CommandEmpty>
                      <CommandGroup>
                        {filteredDoctors.map((doctor) => (
                          <CommandItem
                            className="text-white"
                            key={doctor._id}
                            value={doctor._id}
                            onSelect={(currentValue) => {
                              setSelectedDoctor(
                                currentValue === selectedDoctor
                                  ? ""
                                  : currentValue
                              );
                              setValue("doctor", currentValue);
                              setDocOpen(false);
                              setItemsOpen(true);
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedDoctor === doctor._id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {doctor.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* <div className="mb-6">
              {availableItems.length > 0 ? (
                availableItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center mb-4 justify-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      id={`item-checkbox-${index}`}
                      checked={selectedItems.some(
                        (selectedItem) => selectedItem.name === item.name
                      )} // <-- Corrected: Check if item is selected based on name
                      onChange={(e) =>
                        handleItemSelection(item, e.target.checked)
                      }
                      className="block size-5 bg-red-600 border-gray-800 rounded focus:ring-blue-800 focus:ring-2"
                    />

                    <label
                      htmlFor={`item-checkbox-${index}`}
                      className="text-gray-400 bg-gray-700 rounded px-2"
                    >
                      {item.name} (Price: {item.price})
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No items available for this department.
                </p>
              )}
            </div> */}

            <Popover open={itemsOpen} onOpenChange={setItemsOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full px-4 py-3 text-left bg-gray-700 text-white rounded-xl shadow-sm",
                    selectedItems.length === 0 && "text-gray-400"
                  )}
                >
                  {selectedItems.length > 0
                    ? `${selectedItems.length} item(s) selected`
                    : "Select items..."}
                </button>
              </PopoverTrigger>

              <PopoverContent
                className="p-0 max-h-[300px] overflow-auto bg-gray-700 border-gray-500"
                side="bottom"
                align="start"
              >
                {availableItems.length > 0 ? (
                  <Command className="bg-gray-700 text-white">
                    <CommandInput placeholder="Search items..." />
                    <CommandList>
                      <CommandEmpty>No items found.</CommandEmpty>
                      <CommandGroup>
                        {availableItems.map((item, index) => {
                          const isSelected = selectedItems.some(
                            (selectedItem) => selectedItem.name === item.name
                          );

                          return (
                            <CommandItem
                              key={index}
                              value={item.name}
                              onSelect={() =>
                                handleItemSelection(item, !isSelected)
                              }
                              className="text-white flex items-center space-x-2"
                            >
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  readOnly
                                  className="size-4 rounded "
                                />
                                <span>
                                  {item.name} (Price: {item.price})
                                </span>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                ) : (
                  <div className="p-4 text-gray-500">
                    No items available for this department.
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* Render selected items dynamically using useFieldArray */}
            <div>
              <h3 className="text-md font-semibold mb-2 text-gray-100">
                Selected Items:
              </h3>
              {selectedItems.map((selectedItem, index) => (
                <div
                  key={index}
                  className="flex items-center mb-4 space-x-2 lg:space-x-4"
                >
                  {/* Item Name */}
                  <div className="flex-1">
                    <input
                      {...register(`items[${index}].name`)}
                      type="text"
                      defaultValue={selectedItem.name}
                      className="px-4 py-2 bg-gray-700 text-gray-300 outline-none w-full rounded-lg shadow-sm"
                      readOnly
                    />
                  </div>

                  {/* Item Price */}
                  <div className="w-20">
                    <input
                      {...register(`items[${index}].price`)}
                      type="number"
                      defaultValue={selectedItem.price}
                      className="px-2 py-2 bg-gray-700 text-gray-300 outline-none w-full rounded-lg shadow-sm"
                      readOnly
                    />
                  </div>

                  {/* Delete button to remove the selected item */}
                  <button
                    type="button"
                    onClick={() => handleItemSelection(selectedItem, false)} // Uncheck the item
                    className="text-red-500 font-semibold hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        {selectedItems.length > 0 && (
          <p className="font-semibold text-lg text-gray-100">
            Grand Total: ₹{" "}
            {selectedItems?.reduce((sum, item) => sum + item.price, 0)}
          </p>
        )}
      </div>
      <hr className="border border-slate-800 w-full my-2" />
      <div className="w-full flex px-4 gap-3 justify-end">
        <div
          className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
          onClick={() => {
            setNewUserSection((prev) => !prev);
          }}
        >
          Cancel
        </div>
        <button
          type="submit"
          className="w-20 h-8 py-1 flex items-center justify-center gap-2 bg-red-500 rounded-lg font-semibold cursor-pointer text-white"
          disabled={submitting}
        >
          {submitting ? <Loading size={15} /> : <></>}
          {submitting ? "Wait..." : "Confirm"}
        </button>
      </div>
    </form>
  );
};

export default NewDataEntryForm;
