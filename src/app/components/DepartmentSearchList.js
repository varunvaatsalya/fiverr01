"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import AddDeptSection from "./AddDeptSection";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { IoPersonAdd } from "react-icons/io5";

function DepartmentSearchList({ departments, setDepartments }) {
  
  const [newUserSection, setNewUserSection] = useState(false);
  const [resData, setResData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    setResData(departments);
    console.log(departments);
  }, [departments]);

  function updatedata(query) {
    console.log(query);
    let filterRes = departments.filter((department) => {
      let lowerCaseQuery = query.toLowerCase();
      let isDepartmentMatch = department.name
        .toLowerCase()
        .includes(lowerCaseQuery);
      let isItemMatch = department.items.some(
        (item) =>
          item.name.toLowerCase().includes(lowerCaseQuery) ||
          item.price.toString().includes(lowerCaseQuery)
      );
      return isDepartmentMatch || isItemMatch;
    });
    setResData(filterRes);
  }
  return (
    <>
      {newUserSection ? (
        <AddDeptSection
          setNewUserSection={setNewUserSection}
          departments={departments}
          setDepartments={setDepartments}
        />
      ) : (
        <></>
      )}
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar />
        <main className="flex-grow">
          <div className="px-2 lg:px-4 max-w-screen-xl mx-auto">
            <div className="h-16 py-2 flex justify-center gap-2 items-center">
              <input
                type="text"
                placeholder="Search"
                onChange={(e) => {
                  updatedata(e.target.value);
                }}
                className="h-full w-full my-3 text-black text-xl font-medium px-4 rounded-full outline-none bg-gray-300 border-b-2 border-gray-400 focus:bg-transparent"
              />
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
            <div className="h-12 flex justify-center items-center text-xl rounded-full w-3/4 mx-auto bg-black text-white">
              Departments, Items & their prices
            </div>
            {resData.map((department, index) => (
              <div key={index} className="text-black md:w-3/4 mx-auto">
                {/* Department Header */}
                <div
                  className="px-4 py-2 cursor-pointer border-b-2 border-gray-300 hover:rounded-full hover:bg-gray-300 flex justify-between items-center"
                  onClick={() =>
                    setActiveIndex(activeIndex === index ? null : index)
                  }
                >
                  <h3 className="font-semibold text-lg">{department.name}</h3>
                  <span className="text-gray-500">
                    {activeIndex === index ? "-" : "+"}
                  </span>
                </div>

                {/* Department Items (Shown when expanded) */}
                {activeIndex === index && (
                  <div className="">
                    {department.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="px-4 py-2 flex justify-between bg-white border-b-2 border-gray-300 rounded-full"
                      >
                        <span>{item.name}</span>
                        <span className="font-semibold text-gray-700">
                          {item.price}
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

export default DepartmentSearchList;
