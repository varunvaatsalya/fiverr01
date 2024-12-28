"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import NewSurgeryForm from "../../../../components/NewSurgeryForm";
import EditSurgeryForm from "../../../../components/EditSurgeryForm";
import { IoPersonAdd } from "react-icons/io5";

const surgerys1 = [
  {
    name: "manik chandra",
    price: 21,
  },
  {
    name: "manik chandra",
    price: 21,
  },
  {
    name: "manik chandra",
    price: 21,
  },
  {
    name: "manik chandra",
    price: 21,
  },
  {
    name: "manik chandra",
    price: 21,
  },
  {
    name: "manik chandra",
    price: 21,
  },
  {
    name: "manik chandra",
    price: 21,
  },
  {
    name: "manik chandra",
    price: 21,
  },
];

function Page() {
  const [surgerys, setSurgerys] = useState([]);
  const [editSurgery, setEditSurgery] = useState(null);
  const [newUserSection, setNewUserSection] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/ipditems?type=1");
        result = await result.json();
        if (result.success) {
          setSurgerys(result.surgery);
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
            <div className="w-[95%] md:w-4/5 lg:w-3/4 py-4 text-center bg-slate-950 px-4 rounded-xl">
              {editSurgery ? (
                <>
                  <EditSurgeryForm
                    setNewUserSection={setNewUserSection}
                    setSurgerys={setSurgerys}
                    editSurgery={editSurgery}
                    setEditSurgery={setEditSurgery}
                  />
                </>
              ) : (
                <>
                  <NewSurgeryForm
                    setNewUserSection={setNewUserSection}
                    setSurgerys={setSurgerys}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="flex flex-col min-h-screen">
        <Navbar route={["IPD", "Config", "Items"]} />
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
            <div className="h-12 flex justify-center items-center lg:text-xl rounded-full w-full md:w-4/5 lg:w-3/4 mx-auto bg-black text-white">
              Items
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 mx-auto p-4">
              {surgerys.map((surgery, index) => (
                <div
                  key={index}
                  className="w-full p-3 md:w-2/5 lg:w-1/5 bg-black text-white rounded-2xl flex flex-col justify-center items-center"
                >
                  {/* Doctor Header */}
                  <h3 className="font-semibold text-xl capitalize">
                    {surgery.name}
                  </h3>
                  <div className="text-gray-200 text-lg">
                    {"(" + surgery.price + ")"}
                  </div>
                  <div
                    className="mx-auto my-1 font-semibold py-1 px-3 cursor-pointer rounded-full bg-gray-100 text-black"
                    onClick={() => {
                      setEditSurgery(surgery);
                      setNewUserSection((prev) => !prev);
                    }}
                  >
                    Edit
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Page;
