"use client";
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  FaChevronDown,
  FaChevronRight,
  FaRegDotCircle,
  FaWhatsapp,
} from "react-icons/fa";
import { CiCircleRemove } from "react-icons/ci";
import { formatShortDateTime } from "../utils/date";
import { FaCircleCheck } from "react-icons/fa6";
import { RxCrossCircled } from "react-icons/rx";
import { showError, showSuccess } from "../utils/toast";
import { useStockType } from "../context/StockTypeContext";
import { PharmacyDetails } from "../HospitalDeatils";
import Loading from "./Loading";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

function StockOrder({ manufacturers, vendors }) {
  const [message, setMessage] = useState("");
  const [stockType, setStockType] = useState("belowMinstockCount");
  const [vendorId, setVendorId] = useState("");
  const [orderStatus, setOrderStatus] = useState("yetToBeOrdered");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchedMedicines, setSearchedMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [availableSources, setAvailableSources] = useState([]);
  const [isRemoveAllZero, setIsRemoveAllZero] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [collapsedSources, setCollapsedSources] = useState({});

  const sectionType = useStockType();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/orderStock?sectionType=${sectionType}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          showError(data.message);
        }
        setData(data.medicinesWithStock);
        console.log(data.medicinesWithStock);
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
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    filterData(data);
  }, [data]);

  useEffect(() => {
    filterData();
  }, [stockType, vendorId, orderStatus, isRemoveAllZero]);

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

      if (isRemoveAllZero) {
        const min = item.minimumStockCount?.godown;
        const max = item.maximumStockCount?.godown;
        const total = item.totalBoxes;

        const isInvalidMin = min === undefined || min === null || min === 0;
        const isInvalidMax = max === undefined || max === null || max === 0;
        const isInvalidTotal = total === 0;

        if (isInvalidMin && isInvalidMax && isInvalidTotal) return false;
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

  async function handleUpdateCountLimit() {
    setUpdating(true);
    fetch(`/api/newMedicine/updateStockLimit?sectionType=${sectionType}`)
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

  function handleGetContact(group) {
    let contact = null;
    if (group.sourceId === "1" && selectedSource) {
      if (selectedSource.sourceType === "Vendor") {
        const vendor = vendors.find((v) => v._id === selectedSource.sourceId);
        contact = vendor?.contact || null;
      } else if (selectedSource.sourceType === "Manufacturer") {
        const mfg = manufacturers.find(
          (m) => m._id === selectedSource.sourceId
        );
        contact = mfg?.medicalRepresentator?.contact || null;
      }
    } else {
      if (group.sourceType === "Vendor") {
        const vendor = vendors.find((v) => v._id === group.sourceId);
        contact = vendor?.contact || null;
      } else if (group.sourceType === "Manufacturer") {
        const mfg = manufacturers.find((m) => m._id === group.sourceId);
        contact = mfg?.medicalRepresentator?.contact || null;
      }
    }
    return contact;
  }

  const selectedMedicineMap = useMemo(() => {
    const map = new Map();
    selectedMedicines.forEach((med) => map.set(med._id, med));
    return map;
  }, [selectedMedicines]);

  const handleCheckboxChange = (medicine) => {
    if (selectedMedicineMap.has(medicine._id)) {
      setSelectedMedicines((prev) =>
        prev.filter((m) => m._id !== medicine._id)
      );
    } else {
      const calculatedQty =
        medicine.minimumStockCount &&
        medicine.maximumStockCount &&
        medicine.maximumStockCount?.godown >= medicine.totalBoxes &&
        medicine.maximumStockCount?.godown >= medicine.minimumStockCount?.godown
          ? parseInt(medicine.maximumStockCount?.godown - medicine.totalBoxes)
          : "";

      setSelectedMedicines((prev) => [
        ...prev,
        { ...medicine, quantity: calculatedQty },
      ]);
    }
  };

  const groupedBySource = useMemo(() => {
    if (isManualMode) {
      return {
        1: {
          sourceId: "1",
          sourceName: "Manual Mode",
          items: selectedMedicines,
        },
      };
    }

    return selectedMedicines.reduce((acc, medicine) => {
      const sourceId = medicine.latestSource?.id || "0";
      const sourceName =
        medicine.latestSource?.name || "Last Source Not Available!";
      const sourceType = medicine.latestSource?.type || "";

      if (!acc[sourceId]) {
        acc[sourceId] = {
          sourceId,
          sourceType,
          sourceName,
          items: [],
        };
      }

      acc[sourceId].items.push(medicine);
      return acc;
    }, {});
  }, [selectedMedicines, isManualMode]);

  const toggleCollapse = (sourceId) => {
    setCollapsedSources((prev) => ({
      ...prev,
      [sourceId]: !prev[sourceId],
    }));
  };

  const handleQuantityChange = (id, newQuantity) => {
    setSelectedMedicines((prev) =>
      prev.map((m) => (m._id === id ? { ...m, quantity: newQuantity } : m))
    );
  };

  const removeMedicine = (id) => {
    setSelectedMedicines(selectedMedicines.filter((m) => m._id !== id));
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

  async function handleSaveHistory(group) {
    const medicinesWithNameAndQuantity = group.items.map((medicine) => ({
      medicineId: medicine._id,
      name: medicine.name,
      quantity: medicine.quantity,
    }));
    let data = {
      to: group.sourceName,
      mrName:
        group.sourceType === "Manufacturer"
          ? manufacturers.find((mfg) => mfg._id === group.sourceId)
              ?.medicalRepresentator?.name || ""
          : "",
      contact: handleGetContact(group),
      medicines: medicinesWithNameAndQuantity,
    };
    try {
      let result = await fetch("/api/orderStock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, sectionType }),
      });
      result = await result.json();
      alert(result.message);
      setSelectedMedicines((prev) =>
        prev.filter((med) => !group.items.some((item) => item._id === med._id))
      );
    } catch (error) {
      setMessage("Error in submitting application");
      alert("Error in Saving Order History!");
      console.error("Error submitting application:", error);
    }
  }

  const sendWhatsAppMessage = async (sourceId) => {
    let group = groupedBySource[sourceId];
    let contact = handleGetContact(group);
    if (!contact) {
      showError("Please set the contact");
      return;
    }
    if (
      group.items.some(
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

    group.items.forEach((medicine) => {
      message += `Medicine Name: *${medicine.name}*
Required Quantity: *${medicine.quantity}* units

`;
    });

    message += `Thanks & Regards\n`;
    message += `Billing Entity: `;

    message +=
      sectionType === "hospital"
        ? ` *ShivamAkshayvat Hospital (Naini)* \nGST No.: `
        : ` *Upasna Medical Store* \nGST No.: ${PharmacyDetails.gst}
 - (ShivamAkshayvat Hospital, Naini)\n`;

    const encodedMessage = encodeURIComponent(message);

    if (contact) {
      window.open(
        `https://api.whatsapp.com/send?phone=${contact}&text=${encodedMessage}`,
        "_blank"
      );
      window.addEventListener(
        "focus",
        () => {
          const isConfirmed = window.confirm(
            "Did the WhatsApp message send successfully?"
          );
          if (isConfirmed) {
            handleSaveHistory(group);
          }
        },
        { once: true }
      );
    }
  };

  const handleExportMedicineData = () => {
    // 1. Format data into Excel-ready structure
    const formattedData = searchedMedicines.map((item) => ({
      "Medicine Name": item.name,
      "Medicine Type": item.medicineType,
      "Strips per Box": item.packetSize?.strips || "",
      "Tablets per Strip": item.packetSize?.tabletsPerStrip || "",
      "Min Strips": item.minimumStockCount?.godown || 0,
      "Total Strips": item.totalBoxes || 0,
      "Max Strips": item.maximumStockCount?.godown || 0,
      "Latest Source": item.latestSource?.name || "",
      "Source Type": item.latestSource?.type || "",
    }));

    // 2. Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Medicines");

    // 3. Generate Excel file and trigger download
    XLSX.writeFile(workbook, "medicinesOrder.xlsx");
  };

  if (loading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center gap-2">
        <Loading size={50} />
        <div className="text-lg font-semibold">Loading... Stock Data</div>
      </div>
    );
  }

  return (
    <div className="px-2 flex flex-col items-center">
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}

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
              <label
                htmlFor="removeAllZero"
                className="text-white flex items-center gap-2 px-2 py-0.5 bg-green-600 hover:bg-green-700 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="removeAllZero"
                  id="removeAllZero"
                  checked={isRemoveAllZero}
                  onChange={() => {
                    setIsRemoveAllZero(!isRemoveAllZero);
                  }}
                  className="size-4"
                />
                Remove All Zero Med
              </label>
              <Button onClick={handleExportMedicineData}>Export</Button>
              <div className="flex justify-center items-center gap-2">
                {sectionType !== "hospital" && (
                  <>
                    <button
                      disabled={updating}
                      onClick={() => handleUpdateCountLimit("min")}
                      className="px-3 py-1 text-sm rounded-lg bg-blue-500 hover:bg-blue-700 disabled:bg-gray-500 font-semibold"
                    >
                      {updating ? "Updating..." : "Update Stock Limit Qty"}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="bg-gray-950 text-gray-100 font-semibold text-sm rounded-lg flex flex-wrap items-center p-1">
              <div className="w-[5%] text-center">Sr No.</div>
              <div className="w-[30%] text-center">Medicine</div>
              <div className="w-[10%] text-end px-2">Req</div>
              <div className="w-[5%] text-center">Min Qty</div>
              <div className="w-[5%] text-center">Avl Qty</div>
              <div className="w-[5%] text-center">Max Qty</div>
              <div className="w-[15%] text-center">
                Order Status{" "}
                <span className="text-red-500 text-xs">{"(Box)"}</span>
              </div>
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
                    className="w-[30%] min-w-24 line-clamp-1 text-center"
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
                      checked={selectedMedicineMap.has(details._id)}
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
                  <div className="w-[15%] text-center">
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
            <div className="rounded-xl p-2 bg-gray-700 my-4">
              <div className="flex justify-between items-center p-2">
                <div className="text-center font-semibold text-gray-100 text-xl">
                  Selected Medicines
                </div>
                <div className="py-1 px-2 flex items-center rounded-lg bg-gray-200 text-black">
                  <Switch
                    id="manual-mode"
                    checked={isManualMode}
                    onCheckedChange={setIsManualMode}
                    className="data-[state=unchecked]:bg-gray-500 data-[state=checked]:bg-blue-600 mx-1"
                  />
                  <Label htmlFor="manual-mode">Manual Mode</Label>
                </div>
              </div>
              {selectedMedicines.length > 0 && (
                <div className="bg-gray-950 text-gray-100 font-semibold text-sm rounded-lg flex flex-wrap items-center p-1">
                  <div className="w-[5%] text-center">Sr No.</div>
                  <div className="w-[50%] text-center">Medicine</div>
                  <div className="w-[5%] text-center">Min Qty</div>
                  <div className="w-[5%] text-center">Avl Qty</div>
                  <div className="w-[5%] text-center">Max Qty</div>
                  <div className="w-[15%] text-center">Offers</div>
                  <div className="w-[15%] text-center">Qunatity</div>
                </div>
              )}
              <div className="px-2 my-2 max-h-[80vh] overflow-y-auto space-y-3">
                {Object.entries(groupedBySource).map(([key, group]) => {
                  let contact = handleGetContact(group);

                  return (
                    <div
                      key={key}
                      className="space-y-1 bg-gray-800 p-2 rounded-lg"
                    >
                      <div
                        onClick={() => toggleCollapse(key)}
                        title={
                          collapsedSources[key]
                            ? "Click to Expand"
                            : "Click to Collapse"
                        }
                        className="flex justify-between items-center gap-4 px-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {collapsedSources[key] ? (
                            <FaChevronRight className="size-4" />
                          ) : (
                            <FaChevronDown className="size-4" />
                          )}
                          <div
                            className={
                              "px-3 rounded-lg font-semibold text-white " +
                              (key === "0"
                                ? "bg-red-600"
                                : key === "1"
                                ? "bg-green-500"
                                : "")
                            }
                          >
                            {group.sourceName}
                          </div>
                          {collapsedSources[key] && (
                            <div className="italic font-semibold text-sm">{`${group.items.length} Medicines`}</div>
                          )}
                        </div>
                        {key === "1" && (
                          <>
                            <Select
                              onValueChange={(value) => {
                                const [sourceType, sourceId] =
                                  value.split("::");
                                setSelectedSource({
                                  sourceType: sourceType,
                                  sourceId,
                                });
                              }}
                            >
                              <SelectTrigger className="w-1/4">
                                <SelectValue placeholder="Select Vendor or Manufacturer" />
                              </SelectTrigger>

                              <SelectContent className="bg-gray-800 text-white">
                                <SelectGroup>
                                  <SelectLabel className="text-blue-500">
                                    Vendors
                                  </SelectLabel>
                                  {vendors.map((vendor) => (
                                    <SelectItem
                                      key={`vendor-${vendor._id}`}
                                      value={`Vendor::${vendor._id}`}
                                    >
                                      {vendor.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>

                                <SelectGroup>
                                  <SelectLabel className="text-blue-500">
                                    Manufacturers
                                  </SelectLabel>
                                  {manufacturers.map((mfg) => (
                                    <SelectItem
                                      key={`manufacturer-${mfg._id}`}
                                      value={`Manufacturer::${mfg._id}`}
                                    >
                                      {mfg.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </>
                        )}
                        {key !== "0" && (
                          <>
                            {!contact && (
                              <div className="text-red-600 font-semibold">
                                *No Contact Available
                              </div>
                            )}
                            <button
                              onClick={() => {
                                sendWhatsAppMessage(key);
                              }}
                              disabled={
                                !contact ||
                                group.items.some(
                                  (medicine) =>
                                    medicine.quantity === "" ||
                                    medicine.quantity === "0" ||
                                    medicine.quantity === 0
                                )
                              }
                              className="px-2 py-1 rounded-lg bg-green-600 disabled:bg-gray-600 text-white flex items-center gap-1"
                            >
                              <FaWhatsapp className="size-5" />
                              <div className="text-sm font-semibold">
                                Whatsapp
                              </div>
                            </button>
                          </>
                        )}
                      </div>
                      {!collapsedSources[key] &&
                        group.items.map((details, index) => (
                          <div
                            key={index}
                            className="text-gray-100 bg-gray-700 font-semibold text-sm rounded-lg p-1 flex items-center"
                          >
                            <div className="w-[5%] text-center">
                              {index + 1}
                            </div>
                            <div className="w-[50%] text-center">
                              {details.name}
                            </div>
                            <div className="w-[5%] text-center">
                              {details.minimumStockCount?.godown !== undefined
                                ? details.minimumStockCount.godown
                                : "N/A"}
                            </div>
                            <div className="w-[5%] text-center">
                              {details.totalBoxes}
                            </div>
                            <div className="w-[5%] text-center">
                              {details.maximumStockCount?.godown !== undefined
                                ? details.maximumStockCount.godown
                                : "N/A"}
                            </div>
                            <div className="w-[15%] p-1 flex justify-center">
                              {details.latestOffer ? (
                                <div className="rounded px-2 bg-blue-600 text-white font-semibold">
                                  {details.latestOffer.buyingQty +
                                    "+" +
                                    details.latestOffer.offerQty}{" "}
                                </div>
                              ) : (
                                "--"
                              )}
                            </div>
                            <div className="w-[15%] flex justify-center gap-2 items-center">
                              <input
                                type="number"
                                value={details.quantity}
                                placeholder="Qty"
                                onChange={(e) =>
                                  handleQuantityChange(
                                    details._id,
                                    e.target.value
                                  )
                                }
                                className="w-20 text-sm text-gray-100 bg-gray-900 outline-none focus:ring-1 ring-gray-700 rounded-lg py-1 px-2"
                              />
                              <CiCircleRemove
                                onClick={() => removeMedicine(details._id)}
                                className="text-red-600 hover:text-red-500 size-5"
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* <div className="font-semibold text-white">
            {"Send Message to " +
              (selectedType === "manufacturer" ? "MR" : "Vendor")}
          </div> */}
          {/* {!contact && (
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
          </button> */}
        </>
      )}
    </div>
  );
}

export default StockOrder;
