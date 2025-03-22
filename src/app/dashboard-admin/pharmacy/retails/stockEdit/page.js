"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../../components/Navbar";
import Loading from "../../../../components/Loading";
import { IoSearchOutline } from "react-icons/io5";
import { RxCrossCircled } from "react-icons/rx";
import { IoIosArrowDropdown, IoIosArrowDropright } from "react-icons/io";
function Page() {
  const [query, setQuery] = useState("");
  const [searchedMedicinesList, setSearchedMedicinesList] = useState([]);
  const [finding, setFinding] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [details, setDetails] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDropDown(true);
  }, [searchedMedicinesList]);

  const handleSearchMedicine = async () => {
    if (query) {
      try {
        setMessage(null);
        setFinding(true);
        let result = await fetch(`/api/searchMedicine`, {
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
          setSearchedMedicinesList(result.medicines);
        }
        setMessage(result.message);
      } catch (error) {
        console.error("Error submitting application:", error);
      } finally {
        setFinding(false);
        setTimeout(() => {
          setMessage("");
        }, 3500);
      }
    }
  };
  const handleGetMedicineDetails = async () => {
    try {
      setMessage(null);
      let result = await fetch(
        `/api/editRetailStock?id=${selectedMedicine._id}`
      );
      result = await result.json();

      if (result.success) {
        setDetails(result.stocks);
        console.log(result.stocks);
      } else setMessage(result.message);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setTimeout(() => {
        setMessage("");
      }, 3500);
    }
  };
  const handleSetDetails = async () => {
    if(!details) return;
    try {
      setMessage(null);
      setFinding(true);
      let result = await fetch(`/api/editRetailStock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          details,
        }),
      });
      result = await result.json();

      if (result.success) {
        clear();
      }
      setMessage(result.message);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setFinding(false);
      setTimeout(() => {
        setMessage("");
      }, 3500);
    }
  };
  useEffect(() => {
    if (selectedMedicine) handleGetMedicineDetails();
  }, [selectedMedicine]);

  const clear = () => {
    setQuery("");
    setDetails(null);
    setSearchedMedicinesList([]);
    setFinding(false);
    setDropDown(false);
  };

  const handleStockChange = (index, field, value) => {
    const updatedStocks = [...details.stocks];

    if (field.includes(".")) {
      const fields = field.split(".");
      updatedStocks[index][fields[0]][fields[1]] = value;
    } else {
      updatedStocks[index][field] = value;
    }

    setDetails({ ...details, stocks: updatedStocks });
  };

  const removeStock = (id) => {
    const updatedStocks = details.stocks.filter((stock) => stock._id !== id);
    setDetails({ ...details, stocks: updatedStocks });
  };

  return (
    <div>
      <Navbar route={["Pharmacy", "Retails", "Stock Edit"]} />
      <div className="px-2 w-full md:w-3/5 lg:w-1/2 flex flex-col items-center mx-auto">
        {message && (
          <div className="text-center text-red-600 font-semibold">
            {message}
          </div>
        )}
        {selectedMedicine ? (
          <div className="font-semibold text-lg text-gray-700 flex gap-3 items-center p-1">
            <div>
              Medicine Name:{" "}
              <span className="text-blue-500">{selectedMedicine.name}</span>
            </div>
            <button
              onClick={() => {
                setSelectedMedicine(null);
                clear();
              }}
              className="p-1 rounded-lg hover:bg-red-200 text-red-600"
            >
              <RxCrossCircled className="size-4" />
            </button>
          </div>
        ) : (
          <div className="relative p-2 w-full">
            <form className="flex items-center gap-2 w-full">
              <div
                onClick={() => {
                  setDropDown(!dropDown);
                }}
                className="p-2 rounded-lg bg-slate-300 hover:bg-slate-400 cursor-pointer text-gray-700 text-2xl"
              >
                {dropDown ? <IoIosArrowDropdown /> : <IoIosArrowDropright />}
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Medicine with Name"
                className=" block px-4 py-3 w-full text-gray-900 font-semibold bg-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-150 ease-in-out"
              />
              <button
                disabled={finding || !query}
                onClick={handleSearchMedicine}
                className="p-2 rounded-lg bg-slate-700 text-gray-200 text-2xl"
              >
                {finding ? <Loading size={20} /> : <IoSearchOutline />}
              </button>
            </form>
            {dropDown && (
              <div className="absolute w-4/5 my-1 bg-gray-300 rounded-lg p-2 max-h-60 overflow-y-auto scrollbar-hide text-gray-900 ">
                {searchedMedicinesList.length > 0 ? (
                  <div className="space-y-1 flex flex-col items-start">
                    {searchedMedicinesList.map((med) => (
                      <button
                        key={med._id}
                        onClick={() => {
                          setSelectedMedicine(med);
                          setDropDown(false);
                        }}
                        className="px-3 bg-gray-100 text-gray-700 rounded-lg font-semibold"
                      >
                        {med.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 text-gray-500 rounded-lg font-semibold">
                    *No Medicines
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {details &&
          (details.stocks && details.stocks.length > 0 ? (
            <div className="space-y-2 w-full text-black">
              <button
                onClick={handleSetDetails}
                className="px-2 py-1 rounded-lg bg-blue-600 text-white font-semibold"
              >
                Submit
              </button>
              {details.stocks.map((stock,index) => (
                <div
                  key={stock._id}
                  className="bg-slate-300 p-2 w-full rounded-xl flex flex-wrap justify-around items-center gap-3"
                >
                  <div className="flex justify-around items-center flex-wrap w-full">
                    <div className="text-red-600 font-semibold">
                      Total{" "}
                      {(
                        stock.quantity.boxes * stock.packetSize.strips +
                        stock.quantity.extra
                      ).toLocaleString()}{" "}
                      Strips
                      {stock.packetSize.tabletsPerStrip > 1 &&
                      stock.quantity.tablets
                        ? `, ${stock.quantity.tablets.toLocaleString()} Tablets`
                        : ""}
                    </div>
                    <button
                      onClick={() => removeStock(stock._id)}
                      className="text-white bg-red-600 rounded-lg text-sm p-1"
                    >
                      Remove
                    </button>
                  </div>
                  <div>
                    Batch:{" "}
                    <input
                      type="text"
                      value={stock.batchName}
                      onChange={(e) => {
                        handleStockChange(index, "batchName", e.target.value);
                      }}
                      className="px-2 rounded-lg "
                    />
                  </div>
                  <div>
                    Expiry:{" "}
                    <input
                      type="date"
                      value={stock.expiryDate.split("T")[0]}
                      onChange={(e) => {
                        handleStockChange(index, "expiryDate", e.target.value);
                      }}
                      className="px-2 rounded-lg "
                    />
                  </div>
                  <div className="w-full text-center font-semibold text-blue-600">
                    Packet Size
                  </div>
                  <div>
                    Strips:{" "}
                    <input
                      type="number"
                      value={stock.packetSize.strips}
                      onChange={(e) => {
                        handleStockChange(
                          index,
                          "packetSize.strips",
                          e.target.value
                        );
                      }}
                      className="px-2 rounded-lg w-28"
                    />
                  </div>
                  <div>
                    Tablets Per Strip:{" "}
                    <input
                      type="number"
                      value={stock.packetSize.tabletsPerStrip}
                      onChange={(e) => {
                        const value =
                          e.target.value === "" ? 0 : e.target.value;
                        handleStockChange(
                          index,
                          "packetSize.tabletsPerStrip",
                          value
                        );
                      }}
                      className="px-2 rounded-lg w-28"
                    />
                  </div>
                  <div className="w-full text-center font-semibold text-blue-600">
                    Qunatity
                  </div>
                  <div>
                    Boxes:{" "}
                    <input
                      type="number"
                      value={stock.quantity.boxes}
                      onChange={(e) => {
                        handleStockChange(
                          index,
                          "quantity.boxes",
                          e.target.value
                        );
                      }}
                      className="px-2 rounded-lg w-28"
                    />
                  </div>
                  <div>
                    Extra:{" "}
                    <input
                      type="number"
                      value={stock.quantity.extra}
                      onChange={(e) => {
                        handleStockChange(
                          index,
                          "quantity.extra",
                          e.target.value
                        );
                      }}
                      className="px-2 rounded-lg w-28"
                    />
                  </div>
                  {stock.packetSize.tabletsPerStrip > 1 && (
                    <div>
                      Tablets:{" "}
                      <input
                        type="number"
                        value={stock.quantity.tablets}
                        onChange={(e) => {
                          const value =
                            e.target.value === "" ? 0 : e.target.value;
                          handleStockChange(index, "quantity.tablets", value);
                        }}
                        className="px-2 rounded-lg w-28"
                      />
                    </div>
                  )}
                  <div className="w-full text-center font-semibold text-blue-600">
                    Price
                  </div>
                  <div>
                    MRP:{" "}
                    <input
                      type="number"
                      value={stock.sellingPrice}
                      onChange={(e) => {
                        handleStockChange(
                          index,
                          "sellingPrice",
                          e.target.value
                        );
                      }}
                      className="px-2 rounded-lg w-28"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-red-600 font-semibold text-center px-3 py-2 rounded-lg bg-red-100">
              No Stock Avavilable
            </div>
          ))}
      </div>
    </div>
  );
}

export default Page;
