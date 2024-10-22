"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { IoPersonAdd } from "react-icons/io5";
import AddUnitSection from "../../../components/AddUnitSection";

function page() {
  const [units, setUnits] = useState([]);
  const [newUserSection, setNewUserSection] = useState(false);


  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/units");
        result = await result.json();
        if (result.success) {
            setUnits(result.units);
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
        <AddUnitSection
          setNewUserSection={setNewUserSection}
          setUnits={setUnits}
        />
      ) : (
        <></>
      )}
      <div className="flex flex-col min-h-screen bg-gray-200">
        <Navbar route={["Units"]} />
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
            <div className=" w-40 py-3 text-lg font-bold mx-auto text-center rounded-full bg-black text-white">
              Lab units
            </div>
            <div className="flex flex-wrap gap-3 p-2">
              {units.map((unit, index) => {
                return (
                  <div className="py-2 px-4 text-lg font-bold text-center rounded-full bg-black text-white" key={index}>
                    {unit.name}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default page;
