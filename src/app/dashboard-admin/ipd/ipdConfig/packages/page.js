"use client";
import React, { useEffect, useState } from "react";
import { IoPersonAdd } from "react-icons/io5";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import EditPackageForm from "../../../../components/EditPackageForm";
import NewPackageForm from "../../../../components/NewPackageForm";

let packages1 = [
  {
    name: "abcd",
    _id:125,
    items: [
      { name: "sdcs" },
      { name: "sdha" },
      { name: "dbed" },
      { name: "ewfjwh" },
    ],
    price: 125,
  },
  {
    name: "abcd",
    _id:126,
    items: [
      { name: "sdcs" },
      { name: "sdha" },
      { name: "dbed" },
      { name: "ewfjwh" },
    ],
    price: 125,
  },
  {
    name: "abcd",
    _id:127,
    items: [
      { name: "sdcs" },
      { name: "sdha" },
      { name: "dbed" },
      { name: "ewfjwh" },
    ],
    price: 125,
  },
  {
    name: "abcd",
    _id:127,
    items: [
      { name: "sdcs" },
      { name: "sdha" },
      { name: "dbed" },
      { name: "ewfjwh" },
    ],
    price: 125,
  },
];

function Page() {
  const [packages, setPackages] = useState([]);
  const [newUserSection, setNewUserSection] = useState(false);
  const [activePackage, setActivePackage] = useState(null);
  const [editPackage, setEditPackage] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/ipditems?type=2");
        result = await result.json();
        if (result.success) {
          setPackages(result.packages);
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
              {editPackage ? (
                <>
                  <EditPackageForm
                    setNewUserSection={setNewUserSection}
                    setPackages={setPackages}
                    editPackage={editPackage}
                    setEditPackage={setEditPackage}
                  />
                </>
              ) : (
                <>
                  <NewPackageForm
                    setNewUserSection={setNewUserSection}
                    setPackages={setPackages}
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
        <Navbar route={["IPD", "Config", "Packages"]} />
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
              Packages, Price & their Items
            </div>
            {packages.map((Package, index) => (
              <div key={index} className="text-black md:w-3/4 mx-auto">
                <div
                  className={"px-4 py-2 cursor-pointer border-b-2 border-gray-300 rounded-full hover:bg-gray-300 flex justify-between items-center"+(activePackage==index?" bg-gray-300":"")}
                  onClick={() =>
                    setActivePackage(activePackage === index ? null : index)
                  }
                >
                  <h3 className="font-semibold text-lg capitalize">
                    {Package.name}
                  </h3>
                  <div className="text-lg font-semibold">{Package.price}</div>
                  <span className="text-gray-500">
                    {activePackage === index ? "-" : "+"}
                  </span>
                </div>

                {/* Department Items (Shown when expanded) */}
                {activePackage === index && (
                  <>
                    <div className="bg-gray-200 rounded-lg p-2">
                      {Package.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="px-4 py-2 text-center border-b-2 border-gray-300"
                        >
                          <span className="font-semibold text-blue-600">
                            {item.name}
                          </span>
                        </div>
                      ))}
                    <button
                      className="py-2 px-4 mx-auto mt-2 text-white bg-blue-900 rounded-lg font-semibold flex gap-1 items-center"
                      onClick={() => {
                        setEditPackage(Package);
                        setNewUserSection((prev) => !prev);
                      }}
                    >
                      Edit
                    </button>
                    </div>
                  </>
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
