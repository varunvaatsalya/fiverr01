"use client";
import React, { useState } from "react";
import AddNurseSection from "./AddNurseSection";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { IoPersonAdd } from "react-icons/io5";

function AdminsList({ nurses, setNurses }) {
  const [newUserSection, setNewUserSection] = useState(false);

  return (
    <>
      {newUserSection ? (
        <AddNurseSection
          setNewUserSection={setNewUserSection}
          setNurses={setNurses}
        />
      ) : (
        <></>
      )}
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar route={['Admins']} />
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
            <div className="h-12 px-2 text-sm md:text-base flex rounded-full bg-black text-white">
              <div className="md:w-[8%] justify-center px-2 flex items-center pl-2">
                No.
              </div>
              <div className="flex items-center">Name</div>
              <div className="w-2/5 flex items-center justify-center">Email</div>
              <div className="w-2/5 flex items-center justify-center">Password</div>
            </div>
            {nurses.map((nurse, index) => {
              return (
                <div
                  className="h-12 px-4 text-sm md:text-base flex hover:rounded-full text-black border-b-2 border-gray-300 w-full"
                  key={index + 1}
                >
                  <div className="w-[8%] px-2 flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="flex items-center">{nurse.name}</div>
                  <div className="w-2/5 flex items-center justify-center">{nurse.email}</div>
                  <div className="w-2/5 flex items-center justify-center">
                    {nurse.password}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default AdminsList;
