"use client";
import React, { useEffect, useRef, useState } from "react";
import AddAdminSection from "./AddAdminSection";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { IoPersonAdd } from "react-icons/io5";
import Link from "next/link";

function AdminsList({ admins, setAdmins, credentials }) {
  const [newUserSection, setNewUserSection] = useState(false);
  const [isActiveSection, setIsActiveSection] = useState(false);
  const [isDefaultAdminVisible, setIsDefaultAdminVisible] = useState(false);
  const pressedKeys = useRef(new Set());

  const handleKeyDown = (event) => {
    pressedKeys.current.add(event.key.toLowerCase());

    // Check if Q + W + E + R are pressed
    if (event.altKey && event.shiftKey && event.ctrlKey) {
      setIsActiveSection(true);
    }
  };

  // Track keyup events to reset keys
  const handleKeyUp = (event) => {
    pressedKeys.current.delete(event.key.toLowerCase());

    // Reset to default when Enter is pressed
    if (event.key === "Enter") {
      setIsActiveSection(false);
    }
  };

  // Attach event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  async function deleteAdmin(id) {
    try {
      const response = await fetch(`/api/admin`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (result.success) {
        setAdmins((prevAdmins) =>
          prevAdmins.filter((admin) => admin._id !== id)
        );
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  }

  return (
    <>
      {newUserSection ? (
        <AddAdminSection
          setNewUserSection={setNewUserSection}
          setAdmins={setAdmins}
        />
      ) : (
        <></>
      )}
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar route={["Admins"]} />
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
              <div className="w-1/5 flex items-center">Name</div>
              <div className="w-2/5 flex items-center">Email</div>
              <div className="w-1/5 flex items-center justify-center">
                Password
              </div>
              <div className="flex items-center">Delete</div>
            </div>
            {admins.map((admin, index) => {
              return (
                <div
                  className="h-12 px-4 text-sm md:text-base flex hover:rounded-full text-black border-b-2 border-gray-300 w-full"
                  key={index + 1}
                >
                  <div className="w-[8%] px-2 flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="w-1/5 flex items-center">{admin.name || "N/A"}</div>
                  <div className="w-2/5 flex items-center">{admin.email}</div>
                  <div className="w-1/5 flex items-center justify-center">
                    {admin.password}
                  </div>
                  <button
                    onClick={() => {
                      deleteAdmin(admin._id);
                    }}
                    className="flex items-center text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
            {credentials && (
              <div
                className="h-12 px-4 text-sm md:text-base flex hover:rounded-full text-black border-b-2 border-gray-300 w-full select-none"
                onDoubleClick={() =>
                  setIsDefaultAdminVisible(!isDefaultAdminVisible)
                }
                key={"default"}
                title={!isDefaultAdminVisible ? "Double click to view" : ""}
              >
                <div className="w-[8%] px-2 flex items-center justify-center">
                  {admins.length + 1}
                </div>
                <div className="w-1/5 flex items-center">
                  {isDefaultAdminVisible ? credentials.name : "*********"}
                </div>
                <div className="w-2/5 flex items-center">
                  {isDefaultAdminVisible ? credentials.email : "************"}
                </div>
                <div className="w-1/5 flex items-center justify-center">
                  {isDefaultAdminVisible ? credentials.password : "**********"}
                </div>
                <div className="flex items-center">Default</div>
              </div>
            )}
            {isActiveSection && (
              <div className="bg-gray-300 rounded-lg p-2 flex justify-center">
                <Link
                  href="/dashboard-admin/roles/admins/dinvoices"
                  className="px-3 py-1 bg-amber-700 rounded-lg text-white"
                >
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default AdminsList;
