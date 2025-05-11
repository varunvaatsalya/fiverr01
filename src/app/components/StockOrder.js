"use client";
import React, { useEffect, useState } from "react";
import { FaRegDotCircle, FaWhatsapp } from "react-icons/fa";
import { CiCircleRemove } from "react-icons/ci";
import { formatShortDateTime } from "../utils/date";
import { FaCircleCheck } from "react-icons/fa6";
import { RxCrossCircled } from "react-icons/rx";
import { showError, showSuccess } from "../utils/toast";

function StockOrder({ info, selectedType }) {
  const [selectedManfacturer, setSelectedManfacturer] = useState(null);
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [stockType, setStockType] = useState("belowMinstockCount");
  const [vendorId, setVendorId] = useState("");
  const [orderStatus, setOrderStatus] = useState("yetToBeOrdered");
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchedMedicines, setSearchedMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [lowStockManufacturers, setLowStockManufacturers] = useState(new Set());
  const [availableSources, setAvailableSources] = useState([]);
  const [updating, setUpdating] = useState(false);

  async function handleUpdateCountLimit(type) {
    setUpdating(true);
    fetch(`/api/newMedicine/updateStockLimit?type=${type}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showSuccess(data.message);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else showError(data.message);
        setUpdating(false);
      });
  }

  useEffect(() => {
    fetch(`/api/orderStock`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          showError(data.message);
        }
        setAllData(data.medicinesWithStock);
        let sources = Array.from(
          data?.medicinesWithStock
            ?.filter((item) => item.latestSource !== null)
            .reduce((map, { latestSource }) => {
              if (!map.has(latestSource.id)) {
                map.set(latestSource.id, latestSource);
              }
              return map;
            }, new Map())
            .values()
        ).sort((a, b) => a.name.localeCompare(b.name));

        setAvailableSources(sources);
        console.log(data.medicinesWithStock, sources);
        // minimumStockCount?.godown - medicine.totalBoxes
        const lowStockSet = new Set();
        data.medicinesWithStock.forEach((med) => {
          if (
            !med.minimumStockCount ||
            med.totalBoxes < med.minimumStockCount.godown
          ) {
            lowStockSet.add(med.manufacturer);
          }
        });

        setLowStockManufacturers(lowStockSet);
      });
  }, []);

  useEffect(() => {
    // setFilteredData(data);
    filterData(data);
  }, [data]);

  useEffect(() => {
    filterData();
  }, [stockType, vendorId, orderStatus]);

  function filterData() {
    let updatedData = data.filter((item) => {
      // Stock Type Filter
      if (stockType === "belowMinstockCount") {
        if (
          item.minimumStockCount?.godown === undefined ||
          item.totalBoxes > item.minimumStockCount.godown
        )
          return false;
      } else if (stockType === "minStockCountNotSet") {
        if (item.minimumStockCount?.godown !== undefined) return false;
      } else if (stockType === "aboveMinstockCount") {
        if (
          item.minimumStockCount?.godown === undefined ||
          item.totalBoxes <= item.minimumStockCount.godown
        )
          return false;
      }

      // Vendor Filter
      if (vendorId === "null") {
        if (item.latestSource !== null) return false;
      } else if (vendorId && vendorId !== "") {
        if (item.latestSource?.id !== vendorId) return false;
      }

      // Order Info Filter
      if (orderStatus === "ordered") {
        if (!item.stockOrderInfo) return false;
      } else if (orderStatus === "yetToBeOrdered") {
        if (item.stockOrderInfo) return false;
      }

      return true;
    });

    setFilteredData(updatedData);
  }

  function handleSearchMedicine(query) {
    if (query.trim() !== "") {
      const updatedSearchedMedicines = filteredData.filter(
        (medicine) =>
          medicine.latestSource?.name
            ?.toLowerCase()
            .includes(query.toLowerCase()) ||
          medicine.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchedMedicines(updatedSearchedMedicines);
    } else {
      setSearchedMedicines(filteredData);
    }
  }
  useEffect(() => {
    setSearchedMedicines(filteredData);
  }, [filteredData]);

  useEffect(() => {
    if (selectedType !== "manufacturer") {
      setData(allData);
      // setFilteredData(allData);
    } else {
      setData([]);
      setFilteredData([]);
    }
    setSelectedMedicines([]);
  }, [selectedType]);

  useEffect(() => {
    if (selectedManfacturer) {
      let phoneNumber =
        selectedType === "manufacturer"
          ? selectedManfacturer.medicalRepresentator?.contact
            ? selectedManfacturer.medicalRepresentator?.contact
            : ""
          : selectedManfacturer.contact
          ? selectedManfacturer.contact
          : "";
      setContact(phoneNumber);
      if (selectedType === "manufacturer") {
        let data = allData.filter(
          (medicine) => medicine.manufacturer === selectedManfacturer._id
        );
        setData(data);
        console.log(data, selectedManfacturer);
      }
    }
  }, [selectedManfacturer]);

  const handleCheckboxChange = (medicine) => {
    if (selectedMedicines.some((m) => m._id === medicine._id)) {
      setSelectedMedicines(
        selectedMedicines.filter((m) => m._id !== medicine._id)
      );
    } else {
      setSelectedMedicines([
        ...selectedMedicines,
        {
          ...medicine,
          quantity:
            medicine.minimumStockCount &&
            medicine.maximumStockCount &&
            medicine.minimumStockCount?.godown >= medicine.totalBoxes &&
            medicine.maximumStockCount?.godown >=
              medicine.minimumStockCount?.godown
              ? medicine.maximumStockCount?.godown - medicine.totalBoxes
              : "",
        },
      ]);
    }
  };
  const removeMedicine = (id) => {
    setSelectedMedicines(selectedMedicines.filter((m) => m._id !== id));
  };

  const handleQuantityChange = (index, newQuantity) => {
    const updatedMedicines = selectedMedicines.map((details, i) => {
      if (i === index) {
        return { ...details, quantity: newQuantity };
      }
      return details;
    });
    setSelectedMedicines(updatedMedicines);
  };

  const handleSelectAll = () => {
    if (
      searchedMedicines.length === 0 ||
      searchedMedicines.length === selectedMedicines.length
    ) {
      return;
    }
    const newSelectedMedicines = searchedMedicines.map((medicine) => ({
      ...medicine,
      quantity:
        medicine.minimumStockCount &&
        medicine.maximumStockCount &&
        medicine.minimumStockCount?.godown >= medicine.totalBoxes &&
        medicine.maximumStockCount?.godown >= medicine.minimumStockCount?.godown
          ? medicine.maximumStockCount?.godown - medicine.totalBoxes
          : "",
    }));
    setSelectedMedicines(newSelectedMedicines);
  };

  async function handleSaveHistory() {
    const medicinesWithNameAndQuantity = selectedMedicines.map((medicine) => ({
      medicineId: medicine._id,
      name: medicine.name,
      quantity: medicine.quantity,
    }));
    let data = {
      to: selectedManfacturer.name,
      mrName:
        selectedType === "manufacturer"
          ? selectedManfacturer.medicalRepresentator.name
          : "",
      contact,
      medicines: medicinesWithNameAndQuantity,
    };
    try {
      let result = await fetch("/api/orderStock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      result = await result.json();
      alert(result.message);
    } catch (error) {
      setMessage("Error in submitting application");
      alert("Error in Saving Order History!");
      console.error("Error submitting application:", error);
    }
  }

  const sendWhatsAppMessage = async () => {
    if (
      selectedMedicines.some(
        (medicine) =>
          !medicine.quantity ||
          medicine.quantity === undefined ||
          medicine.quantity <= 0
      )
    ) {
      showError("Please Select valid quntity");
      return;
    }
    let message = `Hello,

Here is the list of medicines and the required quantities:

`;

    selectedMedicines.forEach((medicine) => {
      message += `Medicine Name: ${medicine.name}
Required Quantity: ${medicine.quantity} boxes

`;
    });

    message += `Thank you`;

    const encodedMessage = encodeURIComponent(message);

    if (contact) {
      window.open(
        `https://api.whatsapp.com/send?phone=${contact}&text=${encodedMessage}`,
        "_blank"
      );
      // const isConfirmed = window.confirm(
      //   "Did the WhatsApp message send successfully?"
      // );
      // if (isConfirmed) {
      //   alert("Order recorded successfully!");
      // }
      window.addEventListener(
        "focus",
        () => {
          const isConfirmed = window.confirm(
            "Did the WhatsApp message send successfully?"
          );
          if (isConfirmed) {
            handleSaveHistory();
          }
        },
        { once: true }
      ); // Ensure it runs only once
    }
  };
  return (
    <div className="px-2 flex flex-col items-center">
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}
      <label
        className="block font-semibold text-gray-100 text-center capitalize"
        htmlFor="medicine"
      >
        {"Select " + selectedType}
      </label>

      <select
        id="medicine"
        onChange={(e) => {
          const Manufacturer = info.find(
            (manufacturer) => manufacturer._id === e.target.value
          );
          setSelectedManfacturer(Manufacturer);
        }}
        className="my-1 block px-4 py-3 text-white w-full md:w-3/4 mx-auto bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      >
        <option value="">{"-- Select a " + selectedType + " --"}</option>
        {info.map((manufacturer, index) => (
          <option key={index} value={manufacturer._id}>
            {lowStockManufacturers.has(manufacturer._id) ? "--*--" : ""}{" "}
            {manufacturer.name}
          </option>
        ))}
      </select>
      <div className="flex justify-center items-center gap-2 w-full md:w-3/4 ">
        <div className="font-semibold text-sm px-2 text-white">
          Update Stock Limit Qty
        </div>
        <button
          disabled={updating}
          onClick={() => handleUpdateCountLimit("min")}
          className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-700 disabled:bg-gray-500 font-semibold"
        >
          {updating ? "Updating..." : "Min"}
        </button>
        <button
          disabled={updating}
          onClick={() => handleUpdateCountLimit("max")}
          className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-700 disabled:bg-gray-500 text-white font-semibold"
        >
          {updating ? "Updating..." : "Max"}
        </button>
        <FaRegDotCircle className="size-4 animate-pulse text-red-600 ml-2" />
        <div>Have to order this</div>
      </div>
      {data.length > 0 && (
        <>
          <div className="w-full p-2">
            <div className="mb-1 flex flex-wrap justify-center gap-2 items-center">
              <input
                type="text"
                placeholder="Serch by Medicine or Vendor"
                onChange={(e) => {
                  handleSearchMedicine(e.target.value);
                }}
                className="w-1/5 rounded-full bg-gray-700 outline-none focus:ring-2 focus:ring-gray-600 px-3 py-1"
              />
              <select
                value={stockType}
                onChange={(e) => setStockType(e.target.value)}
                className="bg-gray-700 rounded-lg text-white px-2 py-1"
              >
                <option value="all">All</option>
                <option value="belowMinstockCount">
                  Below Min stock Count
                </option>
                <option value="minStockCountNotSet">
                  Min Stock Count not set
                </option>
                <option value="aboveMinstockCount">
                  Above Min stock Count
                </option>
              </select>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="bg-gray-700 rounded-lg text-white px-2 py-1"
              >
                <option value="">All Vendor</option>
                <option value="null">Vendor Not Available</option>
                {availableSources.map((vendor, index) => (
                  <option key={index} value={vendor.id}>
                    {vendor.type[0] + " | " + vendor.name}
                  </option>
                ))}
              </select>

              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="bg-gray-700 rounded-lg text-white px-2 py-1"
              >
                <option value="">All type</option>
                <option value="yetToBeOrdered">Yet to order</option>
                <option value="ordered">ordered</option>
              </select>
              <button
                className="px-3 py-1 border border-gray-500 hover:bg-gray-600 rounded-full flex justify-center items-center gap-2"
                disabled={
                  searchedMedicines.length === 0 ||
                  searchedMedicines.length === selectedMedicines.length
                }
                onClick={handleSelectAll}
              >
                <div className="flex justify-center items-center outline outline-1 outline-offset-1 outline-gray-500 w-4 h-4 rounded-full">
                  {searchedMedicines.length === selectedMedicines.length && (
                    <FaCircleCheck className="text-gray-200" />
                  )}
                </div>
                <div className="font-semibold text-gray-200">Select All</div>
              </button>
              {selectedMedicines.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedMedicines([]);
                  }}
                  className="px-3 py-1 text-gray-200 border border-gray-500 rounded-full flex justify-center items-center gap-2"
                >
                  <RxCrossCircled className="size-5" />
                  <div className="font-semibold">Clear</div>
                </button>
              )}
            </div>
            <div className="bg-gray-950 text-gray-100 font-semibold text-sm rounded-lg flex flex-wrap items-center p-1">
              <div className="w-[5%] text-center">Sr No.</div>
              <div className="w-[35%] text-center">Medicine</div>
              <div className="w-[10%] text-end px-2">Req</div>
              <div className="w-[5%] text-center">Min Qty</div>
              <div className="w-[5%] text-center">Avl Qty</div>
              <div className="w-[5%] text-center">Max Qty</div>
              <div className="w-[10%] text-center">Order Status</div>
              <div className="w-[25%] text-center">Prev Source</div>
            </div>

            <div className="px-2 max-h-[70vh] overflow-y-auto my-2">
              {searchedMedicines.map((details, index) => (
                <div
                  key={index}
                  className="border-b border-gray-900 text-gray-100 font-semibold text-sm rounded-lg p-1 flex items-center flex-wrap"
                >
                  <div className="w-[5%] text-center">{index + 1}</div>
                  <div
                    className="w-[35%] min-w-24 line-clamp-1 text-center"
                    title={details.name}
                  >
                    {details.name}
                  </div>
                  <div className="w-[10%] flex justify-end gap-2 items-center px-2">
                    {(details.minimumStockCount?.godown === undefined ||
                      details.minimumStockCount?.godown >=
                        details.totalBoxes) && (
                      <FaRegDotCircle className="size-4 animate-pulse text-red-600" />
                    )}
                    <input
                      type="checkbox"
                      className="size-5 cursor-pointer"
                      checked={selectedMedicines.some(
                        (m) => m._id === details._id
                      )}
                      onChange={() => handleCheckboxChange(details)}
                      id={index}
                    />
                  </div>
                  <div className="w-[5%] text-center">
                    {details.minimumStockCount?.godown !== undefined
                      ? details.minimumStockCount.godown
                      : "N/A"}
                  </div>
                  <div className="w-[5%] text-center">{details.totalBoxes}</div>
                  <div className="w-[5%] text-center">
                    {details.maximumStockCount?.godown !== undefined
                      ? details.maximumStockCount.godown
                      : "N/A"}
                  </div>
                  <div className="w-[10%] text-center">
                    {details.stockOrderInfo ? (
                      <>
                        <span className="italic font-normal">
                          {formatShortDateTime(
                            details.stockOrderInfo?.orderedAt
                          )}
                        </span>
                        {"  |  "}
                        <span className="text-red-500">
                          {details.stockOrderInfo?.quantity}
                        </span>
                      </>
                    ) : (
                      "--"
                    )}
                  </div>
                  <div
                    title={
                      details.latestSource
                        ? details.latestSource?.type +
                          " | " +
                          details.latestSource?.name
                        : ""
                    }
                    className="w-[25%] text-nowrap line-clamp-1 text-center"
                  >
                    {details.latestSource ? (
                      <>
                        <span className="italic  text-red-500">
                          {details.latestSource?.type[0]}
                        </span>
                        {"  |  "}
                        <span className="font-normal">
                          {details.latestSource?.name}
                        </span>
                      </>
                    ) : (
                      "--"
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-2 bg-gray-600 my-4">
              <div className="text-center font-semibold text-gray-400 text-lg">
                Selected Medicines
              </div>
              <div className="px-2 my-2 max-h-[50vh] overflow-y-auto">
                {selectedMedicines.map((details, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-900 text-gray-100 bg-gray-800 font-semibold text-sm rounded-lg p-1 flex items-center"
                  >
                    <div className="w-[5%] text-center">{index + 1}</div>
                    <div className="w-[50%] text-center">{details.name}</div>
                    <div className="w-[10%] text-center">
                      {details.minimumStockCount?.godown !== undefined
                        ? details.minimumStockCount.godown
                        : "N/A"}
                    </div>
                    <div className="w-[10%] text-center">
                      {details.maximumStockCount?.godown !== undefined
                        ? details.maximumStockCount.godown
                        : "N/A"}
                    </div>
                    <div className="w-[10%] text-center">
                      {details.totalBoxes}
                    </div>
                    <div className="w-[15%] flex justify-center gap-2 items-center">
                      <input
                        type="number"
                        value={details.quantity}
                        placeholder="Qty"
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                        className="w-20 text-sm text-gray-100 bg-gray-600 outline-none focus:ring-1 ring-gray-700 rounded-lg py-1 px-2"
                      />
                      <CiCircleRemove
                        onClick={() => removeMedicine(details._id)}
                        className="text-red-400 hover:text-red-500 size-5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="font-semibold text-white">
            {"Send Message to " +
              (selectedType === "manufacturer" ? "MR" : "Vendor")}
          </div>
          {!contact && (
            <div className="text-red-600 text-sm">No Contact Available</div>
          )}
          <button
            onClick={sendWhatsAppMessage}
            disabled={
              !contact ||
              !selectedMedicines.length ||
              selectedMedicines.some((medicine) => medicine.quantity === "")
            }
            className="px-3 py-2 font-semibold rounded-lg bg-green-600 disabled:bg-gray-700 text-white my-2 mx-auto flex gap-2"
          >
            <FaWhatsapp className="size-6" />
            <div>Whatsapp</div>
          </button>
        </>
      )}
    </div>
  );
}

export default StockOrder;
