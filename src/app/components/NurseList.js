"use client";
import React, { useState } from "react";
import AddNurseSection from "./AddNurseSection";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { IoPersonAdd } from "react-icons/io5";

function AdminsList({ nurses, setNurses }) {
  const [newUserSection, setNewUserSection] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  async function removeUser(id) {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/newNurse`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (result.success) {
        setActiveIndex(null);
        setNurses((prevNurses) => prevNurses.filter((user) => user._id !== id));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    setIsDeleting(false);
  }

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
        <Navbar route={["Nurse"]} />
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
              <div className="w-2/5 flex items-center justify-center">
                Email
              </div>
              <div className="w-2/5 flex items-center justify-center">
                Password
              </div>
            </div>
            {nurses.map((nurse, index) => {
              return (
                <>
                  <div
                    onClick={() =>
                      setActiveIndex(activeIndex === index ? null : index)
                    }
                    className="h-12 px-4 text-sm md:text-base flex hover:rounded-full text-black border-b-2 border-gray-300 w-full cursor-pointer"
                    key={index + 1}
                  >
                    <div className="w-[8%] px-2 flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex items-center">{nurse.name}</div>
                    <div className="w-2/5 flex items-center justify-center">
                      {nurse.email}
                    </div>
                    <div className="w-2/5 flex items-center justify-center">
                      {nurse.password}
                    </div>
                  </div>
                  {activeIndex === index && (
                    <div className="w-full px-3 py-3 bg-gray-200 rounded-b-xl text-center">
                      <button
                        onClick={() => {
                          removeUser(nurse._id);
                        }}
                        disabled={isDeleting}
                        className="py-2 px-4 text-white bg-red-700 disabled:bg-gray-600 rounded-lg font-semibold flex gap-1 items-center"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </>
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
