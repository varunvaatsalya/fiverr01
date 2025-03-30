"use client";
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";

function RetailStockEdit() {
  const [query, setQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [medicineStock, setMedicineStock] = useState(null);
  const [finding, setFinding] = useState(false);
  const [details, setDetails] = useState([]);
  const [message, setMessage] = useState("");

  const groupAndCountMedicines = (stocks) => {
    const grouped = {};
    stocks.forEach((stock) => {
      const firstLetter = stock.medicine.name[0].toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = {
          medicines: [],
        };
      }
      grouped[firstLetter].medicines.push({ ...stock, isEdit: false });
    });
    setSelectedLetter(Object.keys(grouped)[0]);
    return grouped;
  };

  // const handleSearchMedicine = async () => {
  //   if (query) {
  //     try {
  //       setMessage(null);
  //       setFinding(true);
  //       let result = await fetch(`/api/searchMedicine`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           query,
  //         }),
  //       });
  //       result = await result.json();

  //       if (result.success) {
  //         setSearchedMedicinesList(result.medicines);
  //       }
  //       setMessage(result.message);
  //     } catch (error) {
  //       console.error("Error submitting application:", error);
  //     } finally {
  //       setFinding(false);
  //       setTimeout(() => {
  //         setMessage("");
  //       }, 3500);
  //     }
  //   }
  // };

  const fetchData = async () => {
    try {
      setMessage(null);
      let result = await fetch(`/api/editRetailStock`);
      result = await result.json();

      if (result.success) {
        let medcinesStock = groupAndCountMedicines(result.stocks);
        setMedicineStock(medcinesStock);
      } else setMessage(result.message);
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setTimeout(() => {
        setMessage("");
      }, 3500);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (medicineStock) {
      setDetails(medicineStock[selectedLetter].medicines);
    }
  }, [medicineStock, selectedLetter]);

  const handleSave = async () => {
    let data = details
      .filter((medicine) => medicine.isEdit)
      .map(({ isEdit, ...medicineWithoutEdit }) => medicineWithoutEdit);
    if (data.length === 0) return;
    try {
      setMessage(null);
      setFinding(true);
      let result = await fetch(`/api/editRetailStock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
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

  const clear = () => {
    setDetails([]);
    setFinding(false);
  };

  const handleStockChange = (medicineIndex, stockIndex, field, value) => {
    setDetails((prevDetails) => {
      return prevDetails.map((medicine, idx) => {
        if (idx !== medicineIndex) return medicine;

        const updatedStocks = medicine.stocks.map((stock, sIdx) => {
          if (sIdx !== stockIndex) return stock;

          if (field.includes(".")) {
            const [parentField, childField] = field.split(".");
            return {
              ...stock,
              [parentField]: {
                ...stock[parentField],
                [childField]: value,
              },
            };
          } else {
            return {
              ...stock,
              [field]: value,
            };
          }
        });

        return {
          ...medicine,
          stocks: updatedStocks,
          isEdit: true,
        };
      });
    });
  };

  const removeStock = (medicineIndex, stockId) => {
    setDetails((prevDetails) => {
      return prevDetails.map((medicine, idx) => {
        if (idx !== medicineIndex) return medicine;

        const updatedStocks = medicine.stocks.filter(
          (stock) => stock._id !== stockId
        );

        return {
          ...medicine,
          stocks: updatedStocks,
          isEdit: true,
        };
      });
    });
  };

  if (!medicineStock) {
    return (
      <div className="w-[95%] md:w-4/5 lg:w-3/4 text-center bg-red-200 text-red-700 py-2 text-lg font-semibold rounded-xl mx-auto my-2">
        Access Denied!
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen h-screen">
      <Navbar route={["Pharmacy", "Retails", "Stock Edit"]} />
      {message && (
        <div className="text-center text-red-600 font-semibold">{message}</div>
      )}
      <div className="w-full flex justify-around gap-2 items-center my-1 px-2">
        <div className="flex flex-wrap justify-center items-center w-2/5 gap-2 px-2">
          {medicineStock &&
            Object.keys(medicineStock).map((letter) => {
              return (
                <button
                  key={letter}
                  onClick={() => {
                    setSelectedLetter(letter);
                  }}
                  className={
                    "w-8 text-sm aspect-square border border-gray-900 text-black hover:bg-gray-800 hover:text-gray-100 rounded flex justify-center items-center" +
                    (selectedLetter === letter
                      ? " bg-gray-800 text-gray-100"
                      : "")
                  }
                >
                  {letter}
                </button>
              );
            })}
        </div>
        <input
          type="text"
          name="search"
          id="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Medicine with Name"
          className=" block px-2 py-1 text-gray-900 font-semibold bg-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-150 ease-in-out"
        />
      </div>
      <div className="flex-1 px-2 w-full overflow-y-auto">
        {details.length > 0 ? (
          <div className="w-full space-y-1">
            <button
              onClick={handleSave}
              disabled={finding}
              className="px-2 py-1 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg "
            >
              {finding ? "Saving..." : "Save"}
            </button>
            <div className="bg-gray-900 rounded-lg flex flex-wrap items-center justify-around gap-1 font-semibold text-sm py-1 px-2 text-white">
              <div className="flex-1 min-w-28 text-center">Batch</div>
              <div className="flex-1 min-w-28 text-center">Expiry</div>
              <div className="flex-1 min-w-28 text-center">Boxes</div>
              <div className="flex-1 min-w-28 text-center">Extra</div>
              <div className="flex-1 min-w-28 text-center">Tablets</div>
              <div className="flex-1 min-w-28 text-center">MRP</div>
              <div className="flex-1 min-w-28 text-center">Strips</div>
              <div className="flex-1 min-w-28 text-center">Tbs/Strp</div>
              <div className="flex-1 min-w-28 text-center">
                {"Total(Strips)"}
              </div>
              <div className="flex-1 min-w-28 text-center">Remove</div>
            </div>
            {details.map((mStocks, it) => (
              <div
                key={mStocks._id}
                className={"w-full rounded-lg p-1 bg-slate-300"}
              >
                <div className="flex justify-between gap-4 items-center text-sm px-3 py-1">
                  <div className=" w-1/2 font-semibold text-blue-600">
                    {mStocks.medicine.name}
                  </div>
                  {mStocks.isEdit && (
                    <div className="bg-red-200 text-red-700 font-semibold px-2 rounded-lg">
                      Edited
                    </div>
                  )}
                  <div className="text-red-600 font-semibold">
                    Total{" "}
                    {mStocks.stocks
                      .reduce((sum, stock) => {
                        return (
                          sum +
                          stock.quantity.boxes * stock.packetSize.strips +
                          stock.quantity.extra
                        );
                      }, 0)
                      .toLocaleString()}{" "}
                    Strips
                    {mStocks.stocks.length > 1 &&
                      mStocks.stocks[0]?.packetSize.tabletsPerStrip > 1 &&
                      `, ${mStocks.stocks
                        .reduce((sum, stock) => {
                          return (
                            sum +
                            (stock.packetSize.tabletsPerStrip > 1
                              ? stock.quantity.tablets || 0
                              : 0)
                          );
                        }, 0)
                        .toLocaleString()} Tablets`}
                  </div>
                </div>
                {mStocks.stocks && mStocks.stocks.length > 0 ? (
                  <div className=" w-full text-black">
                    {mStocks.stocks.map((stock, index) => (
                      <div
                        key={stock._id}
                        className="bg-slate-300 rounded-lg flex flex-wrap items-center justify-around gap-1  text-sm py-1 px-2 text-black"
                      >
                        <input
                          type="text"
                          value={stock.batchName}
                          onChange={(e) => {
                            handleStockChange(
                              it,
                              index,
                              "batchName",
                              e.target.value
                            );
                          }}
                          className="px-2 rounded flex-1 min-w-28"
                        />
                        <input
                          type="date"
                          value={stock.expiryDate.split("T")[0]}
                          onChange={(e) => {
                            handleStockChange(
                              it,
                              index,
                              "expiryDate",
                              e.target.value
                            );
                          }}
                          className="px-2 rounded flex-1 min-w-28"
                        />
                        <input
                          type="number"
                          value={stock.quantity.boxes}
                          onChange={(e) => {
                            handleStockChange(
                              it,
                              index,
                              "quantity.boxes",
                              e.target.value
                            );
                          }}
                          className="px-2 rounded flex-1 min-w-28"
                        />
                        <input
                          type="number"
                          value={stock.quantity.extra}
                          onChange={(e) => {
                            handleStockChange(
                              it,
                              index,
                              "quantity.extra",
                              e.target.value
                            );
                          }}
                          className="px-2 rounded flex-1 min-w-28"
                        />
                        <div className="flex-1 min-w-28">
                          {stock.packetSize.tabletsPerStrip > 1 && (
                            <input
                              type="number"
                              value={stock.quantity.tablets}
                              onChange={(e) => {
                                const value =
                                  e.target.value === "" ? 0 : e.target.value;
                                handleStockChange(
                                  it,
                                  index,
                                  "quantity.tablets",
                                  value
                                );
                              }}
                              className="px-2 rounded w-full"
                            />
                          )}
                        </div>
                        <input
                          type="number"
                          value={stock.sellingPrice}
                          onChange={(e) => {
                            handleStockChange(
                              it,
                              index,
                              "sellingPrice",
                              e.target.value
                            );
                          }}
                          className="px-2 rounded flex-1 min-w-28"
                        />
                        <input
                          type="number"
                          value={stock.packetSize.strips}
                          onChange={(e) => {
                            handleStockChange(
                              it,
                              index,
                              "packetSize.strips",
                              e.target.value
                            );
                          }}
                          className="px-2 rounded flex-1 min-w-28"
                        />
                        <input
                          type="number"
                          value={stock.packetSize.tabletsPerStrip}
                          onChange={(e) => {
                            const value =
                              e.target.value === "" ? 0 : e.target.value;
                            handleStockChange(
                              it,
                              index,
                              "packetSize.tabletsPerStrip",
                              value
                            );
                          }}
                          className="px-2 rounded flex-1 min-w-28"
                        />
                        <div className="flex-1 min-w-28 text-center text-blue-600 font-semibold">
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
                          onClick={() => removeStock(it, stock._id)}
                          className="flex-1 min-w-28 text-center text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-red-600 font-semibold text-center text-sm">
                    No Stock Avavilable
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-red-600 font-semibold text-center px-3 py-2 rounded-lg bg-red-100">
            No Medicine Stock Avavilable
          </div>
        )}
      </div>
    </div>
  );
}

export default RetailStockEdit;
