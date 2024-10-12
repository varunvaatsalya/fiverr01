"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import AddSection from "./AddSection";
import NewDoctorForm from "./NewDoctorForm";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { IoPersonAdd } from "react-icons/io5";

function DoctorSearchList({ doctors, setDoctors }) {
  const [newUserSection, setNewUserSection] = useState(false);
  const [resData, setResData] = useState([]);
  //   const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    setResData(doctors);
    console.log(doctors);
  }, [doctors]);

  function updatedata(query) {
    console.log(query);
    let filterRes = doctors.filter((doctor) => {
      let lowerCaseQuery = query.toLowerCase();
      return (
        doctor.name.toLowerCase().includes(lowerCaseQuery) ||
        doctor.specialty.toLowerCase().includes(lowerCaseQuery) ||
        doctor.department.name.toLowerCase().includes(lowerCaseQuery)
      );
    });
    setResData(filterRes);
  }
  return (
    <>
      {newUserSection ? (
        <AddSection
          setNewUserSection={setNewUserSection}
          setEntity={setDoctors}
          FormComponent={NewDoctorForm}
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
              Doctors, Specialty & their Department
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 mx-auto p-4">
              {resData.map((doctor, index) => (
                <div key={index} className="w-full p-3 h-48 md:w-2/5 lg:w-1/5 bg-black text-white rounded-2xl flex flex-col justify-center items-center">
                  {/* Doctor Header */}
                    <h3 className="font-semibold text-xl capitalize">{doctor.name}</h3>
                    <div className="text-gray-200">{"("+doctor.specialty+")"}</div>
                    <div className="text-gray-200 text-sm">{"("+doctor.email+")"}</div>
                    <div className="text-xl my-2 font-semibold capitalize">{doctor.department.name}</div>
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

export default DoctorSearchList;
