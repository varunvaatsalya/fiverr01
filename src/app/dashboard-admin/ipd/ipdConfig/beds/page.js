"use client";
import React, { useEffect, useState } from "react";
import { IoPersonAdd } from "react-icons/io5";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import NewBedsForm from "../../../../components/NewBedsForm";
import EditBedsForm from "../../../../components/EditBedsForm";

let wardBeds1 = [
  {
    name: "ICU",
    beds: [
      {
        bedName: "ICU1",
        isOccupied: false,
        price: 2000,
      },
      {
        bedName: "ICU2",
        isOccupied: true,
        price: 2500,
      },
      {
        bedName: "ICU3",
        isOccupied: true,
        price: 2000,
      },
      {
        bedName: "ICU4",
        isOccupied: false,
        price: 3000,
      },
    ],
  },
  {
    name: "Genral",
    beds: [
      {
        bedName: "Genral1",
        isOccupied: false,
        price: 1000,
      },
      {
        bedName: "Genral2",
        isOccupied: true,
        price: 1500,
      },
      {
        bedName: "Genral4",
        isOccupied: false,
        price: 1400,
      },
    ],
  },
  {
    name: "Private",
    beds: [
      {
        bedName: "Private1",
        isOccupied: false,
        price: 2000,
      },
      {
        bedName: "Private2",
        isOccupied: true,
        price: 2500,
      },
      {
        bedName: "Private3",
        isOccupied: true,
        price: 2000,
      },
      {
        bedName: "Private4",
        isOccupied: false,
        price: 3000,
      },
    ],
  },
];

function Page() {
  const [wardBeds, setWardBeds] = useState([]);
  const [newUserSection, setNewUserSection] = useState(false);
  const [activeWards, setActiveWards] = useState(null);
  const [mode, setMode] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/wardbed");
        result = await result.json();
        if (result.success) {
          setWardBeds(result.wardBeds);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  return (
    <>
      {newUserSection ? (
        <div className="absolute top-0 left-0">
          <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
            <div className="w-[95%] md:w-1/2 py-4 text-center bg-slate-950 px-4 rounded-xl">
              {!mode && (
                <div className=" space-y-3 font-semibold text-xl text-gray-100">
                  <div className="text-center">Choose the mode</div>
                  <button
                    onClick={() => {
                      setMode(1);
                    }}
                    className="rounded-xl w-full p-4 bg-slate-800"
                  >
                    Add New Ward & Beds
                  </button>
                  <button
                    onClick={() => {
                      setMode(-1);
                    }}
                    className="rounded-xl w-full p-4 bg-slate-800"
                  >
                    Edit Current Ward & Beds
                  </button>
                  <hr className="border border-slate-800 w-full my-2" />
                  <button
                    className="p-2 border text-white border-slate-700 rounded-lg font-semibold"
                    onClick={() => {
                      setNewUserSection((prev) => !prev);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              {mode === 1 && (
                <NewBedsForm
                  setNewUserSection={setNewUserSection}
                  setWardBeds={setWardBeds}
                  setMode={setMode}
                />
              )}
              {mode === -1 && (
                <EditBedsForm
                  setNewUserSection={setNewUserSection}
                  wardBeds={wardBeds}
                  setWardBeds={setWardBeds}
                  setMode={setMode}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="flex flex-col min-h-screen">
        <Navbar route={["IPD", "Config", "Beds"]} />
        <main className="flex-grow">
          <div className="px-2 lg:px-4 max-w-screen-xl mx-auto">
            <div className="h-16 py-2 flex justify-center gap-2 items-center">
              <button
                onClick={() => {
                  setNewUserSection((newUserSection) => !newUserSection);
                }}
                className="flex justify-center items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 h-full rounded-full font-semibold"
              >
                <IoPersonAdd />
                <div>Add</div>
              </button>
            </div>
            <div className="h-12 flex justify-center items-center lg:text-xl rounded-full w-3/4 mx-auto bg-black text-white">
              Wards, Beds & their Prices
            </div>
            {wardBeds.map((wardBed, index) => (
              <div key={index} className="text-black md:w-3/4 mx-auto">
                <div
                  className="px-4 py-2 cursor-pointer border-b-2 border-gray-300 hover:rounded-full hover:bg-gray-300 flex justify-between items-center"
                  onClick={() =>
                    setActiveWards(activeWards === index ? null : index)
                  }
                >
                  <h3 className="font-semibold text-lg capitalize">
                    {wardBed.name}
                  </h3>
                  <span className="text-gray-500">
                    {activeWards === index ? "-" : "+"}
                  </span>
                </div>

                {/* Department Items (Shown when expanded) */}
                {activeWards === index && (
                  <div className="">
                    {wardBed.beds.map((bed, itemIndex) => (
                      <div
                        key={itemIndex}
                        className={"px-4 py-2 flex justify-between border-b-2 border-gray-300 rounded-full "+(bed.isOccupied?'bg-red-400':'bg-green-400')}
                      >
                        <span>{bed.bedName}</span>
                        <span className="font-semibold text-gray-700">
                          {bed.price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Page;
