"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../../components/Navbar";
import { RxCrossCircled } from "react-icons/rx";
import { FaCircleCheck } from "react-icons/fa6";
import { showError, showInfo } from "../../../../utils/toast";

function Page() {
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [finaling, setFinaling] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedType, setSelectedType] = useState("hospital");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      let result = await fetch(
        `/api/bulkDiscount?startDateTime=${startDateTime}&endDateTime=${endDateTime}&type=${selectedType}`
      );
      result = await result.json();
      if (result.success) {
        setPrescriptions(result.prescriptions);
        setDepartments(result.departments);
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };
  const handleFilter = () => {
    let filtered = prescriptions;

    if (selectedDepartment) {
      filtered = filtered.filter((p) =>
        selectedDepartment.includes(p.department._id)
      );
    }
    if (selectedItem) {
      filtered = filtered
        .map((p) => ({
          ...p,
          items: p.items.filter((item) => item.name === selectedItem),
        }))
        .filter((p) => p.items.length > 0);
    }
    if (selectedPaymentMode) {
      filtered = filtered.filter((p) => p.paymentMode === selectedPaymentMode);
    }

    setFilteredPrescriptions(filtered);
  };

  function clear() {
    setDepartments([]);
    setSelectedItem(null);
    setSelectedIds([]);
    setStartDateTime("");
    setEndDateTime("");
    setDiscountPercentage("");
    setPrescriptions([]);
    setFilteredPrescriptions([]);
  }

  useEffect(() => {
    handleFilter();
  }, [prescriptions, selectedDepartment, selectedItem, selectedPaymentMode]);

  async function handleSubmit() {
    setFinaling(true);
    try {
      // Make a POST request to the API with the request ID
      const response = await fetch(`/api/bulkDiscount?type=${selectedType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceIds: selectedIds.map((p) => p._id),
          discountPercentage,
        }), // Send requestId in the body
      });

      // Parse the JSON response
      const result = await response.json();

      showInfo(result.message);
      if (result.success) {
        setTimeout(() => {
          clear();
        }, 1500);
      }
    } catch (error) {
      console.error("Error resolving the request:", error);
      showError("An error occurred while resolving the request.");
    } finally {
      setFinaling(false);
    }
  }

  const getTotalAmount = (ps) => {
    let total = ps.reduce((sum, p) => sum + p.price.total, 0);
    return parseFloat(total?.toFixed(2));
  };
  const getTotalDiscountAmount = () => {
    let total = getTotalAmount(selectedIds);
    return parseFloat((total - (total * discountPercentage) / 100).toFixed(2));
  };

  const getItems = () => {
    let dept = departments.find((depts) => depts._id === selectedDepartment);
    return dept.items || [];
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="w-full">
        <Navbar route={["discount"]} />
      </div>
      <div className="w-full flex flex-wrap justify-center gap-3 my-2">
        <select
          name="type"
          id="type"
          value={selectedType}
          onChange={(e) => {
            clear();
            setSelectedType(e.target.value);
          }}
          className={
            "block text-white w-full md:w-2/5 lg:w-52 px-4 py-3 rounded-xl shadow-sm focus:outline-none ring-2 ring-offset-2  transition duration-150 ease-in-out bg-gray-700 " +
            (selectedType === "hospital" ? "ring-green-600" : "ring-blue-600")
          }
        >
          <option value="hospital">Hospital</option>
          <option value="pharmacy">Pharmacy</option>
        </select>
        <div className="flex justify-center items-center px-2 py-1 gap-2 bg-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out">
          <label
            htmlFor="sdate"
            className=" text-sm lg:text-base font-semibold text-blue-200"
          >
            Start Date :
          </label>
          <input
            id="sdate"
            type="datetime-local"
            onChange={(e) => {
              setStartDateTime(e.target.value);
            }}
            className="block text-white focus:outline-none bg-transparent"
          />
        </div>
        <div className="flex justify-center items-center px-2 py-1 gap-2 bg-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out">
          <label
            htmlFor="edate"
            className=" text-sm lg:text-base font-semibold text-blue-200"
          >
            End Date :
          </label>
          <input
            id="edate"
            type="datetime-local"
            onChange={(e) => {
              setEndDateTime(e.target.value);
            }}
            className="block text-white bg-transparent focus:outline-none"
          />
        </div>
        <button
          onClick={onSubmit}
          className="px-2 py-1 my-2 flex items-center justify-center gap-2 bg-blue-500 rounded-lg font-semibold cursor-pointer text-white"
        >
          {submitting ? "Searching..." : "Search"}
        </button>
      </div>
      <div className="w-full flex flex-wrap items-center justify-center gap-2 bg-slate-800 p-3 text-gray-100">
        {selectedType === "hospital" && (
          <>
            <select
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="block text-white w-full md:w-2/5 lg:w-52 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {selectedDepartment && (
              <select
                onChange={(e) => setSelectedItem(e.target.value)}
                className="block text-white w-full md:w-2/5 lg:w-52 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
              >
                <option value="">Select Item</option>
                {getItems().map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}
          </>
        )}
        <select
          onChange={(e) => setSelectedPaymentMode(e.target.value)}
          className="block text-white w-full md:w-2/5 lg:w-52 px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">Select Payment Mode</option>
          <option value="Card">Card</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
        </select>
      </div>
      {filteredPrescriptions.length > 0 && (
        <>
          <div className="w-4/5 md:w-3/5 flex flex-col min-h-80 max-h-[60vh] rounded-lg border border-gray-700">
            <div className="flex justify-end items-center gap-2 border-b border-gray-700 p-1">
              <button
                className="px-2 py-1 border border-gray-800 hover:bg-gray-200 rounded-full flex justify-center items-center gap-1"
                disabled={
                  filteredPrescriptions.length === 0 ||
                  selectedIds.length === filteredPrescriptions.length
                }
                onClick={() => {
                  setSelectedIds(filteredPrescriptions);
                }}
              >
                <div className="flex justify-center items-center outline outline-1 outline-offset-1 outline-gray-800 w-3 h-3 rounded-full">
                  {filteredPrescriptions.length > 0 &&
                    filteredPrescriptions.length === selectedIds.length && (
                      <FaCircleCheck className="text-gray-800" />
                    )}
                </div>
                <div className="font-semibold text-gray-800">Select All</div>
              </button>
              {selectedIds.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedIds([]);
                  }}
                  className="px-2 py-1 text-gray-800 border border-gray-800 rounded-full flex justify-center items-center gap-1"
                >
                  <RxCrossCircled className="size-4" />
                  <div className="font-semibold">Clear</div>
                </button>
              )}
            </div>
            <div className="flex-1 min-h-0 w-full overflow-y-auto scrollbar-hide p-1 space-y-1">
              {filteredPrescriptions.map((prescription, index) => {
                let isSelected = selectedIds.some(
                  (p) => p._id === prescription._id
                );
                return (
                  <div
                    key={index}
                    className="p-1 bg-gray-300 text-gray-900 font-semibold rounded-lg flex items-center"
                  >
                    <div className="w-[5%]">{index + 1 + "."}</div>
                    <div className="w-[50%] line-clamp-1 px-1">
                      {prescription.patient.name}
                    </div>
                    <div className="w-[10%] text-center">
                      {parseFloat(prescription.price.subtotal?.toFixed(2))}
                    </div>
                    <div className="w-[10%] text-center">
                      {prescription.price.discount
                        ? prescription.price.discount +
                          (selectedType === "hospital" ? " ₹" : "%")
                        : "--"}
                    </div>
                    <div className="w-[10%] text-center">
                      {parseFloat(prescription.price.total?.toFixed(2))}
                    </div>
                    <div className="w-[15%]">
                      <button
                        onClick={() => {
                          if (isSelected) {
                            setSelectedIds((ps) =>
                              ps.filter((p) => p._id !== prescription._id)
                            );
                          } else setSelectedIds((ps) => [...ps, prescription]);
                        }}
                        className={
                          "px-2  rounded-lg font-semibold flex gap-1 items-center " +
                          (isSelected
                            ? "text-white bg-blue-700"
                            : "text-blue-700 border border-blue-700")
                        }
                      >
                        {isSelected ? "Remove" : "Select"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-center items-center gap-2 font-semibold text-gray-800 mt-1">
            <div>
              Total Prescriptions:{" "}
              <span className="text-blue-700">
                {filteredPrescriptions.length}
              </span>
            </div>
            <div>
              Total Amount:{" "}
              <span className="text-blue-700">
                {getTotalAmount(filteredPrescriptions) + "/-"}
              </span>
            </div>
          </div>
          {selectedIds.length > 0 && (
            <>
              <div className="flex justify-center items-center gap-2 font-semibold text-gray-800">
                <div>
                  Selected Prescriptions:{" "}
                  <span className="text-blue-700">{selectedIds.length}</span>
                </div>
                <div>
                  Selected Amount:{" "}
                  <span className="text-blue-700">
                    {getTotalAmount(selectedIds) + "/-"}
                  </span>
                </div>
              </div>
              <input
                type="number"
                max={100}
                min={0}
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                placeholder="Enter the discount in %"
                className="w-3/5 md:w-1/2 lg:w-1/4 px-2 py-1 rounded-lg bg-white text-gray-700"
              />
              {discountPercentage && (
                <>
                  <div className="text-lg font-bold text-gray-700">
                    Final Amount:{" "}
                    <span className="text-blue-700">
                      {getTotalDiscountAmount()}
                    </span>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={finaling}
                    className="bg-blue-700 rounded-lg py-1 px-2 text-white font-semibold"
                  >
                    {finaling ? "Submitting..." : "Submit"}
                  </button>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Page;
