"use client";
import React, { useState } from "react";
import Link from "next/link";
import AddAdminSection from "./AddAdminSection";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { IoPersonAdd } from "react-icons/io5";
import { credentials } from "../credentials";

function AdminsList({ admins, setAdmins }) {
  const [newUserSection, setNewUserSection] = useState(false);

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
        <Navbar />
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
              <div className="w-2/5 flex items-center">Email</div>
              <div className="w-2/5 flex items-center justify-center">Password</div>
              <div className="flex items-center">Delete</div>
            </div>
            {admins.map((admin, index) => {
              return (
                <div
                  className="h-12 px-4 text-sm md:text-base flex hover:rounded-full text-black border-b-2 border-gray-300 w-full cursor-pointer"
                  key={index + 1}
                >
                  <div className="w-[8%] px-2 flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="w-2/5 flex items-center">{admin.email}</div>
                  <div className="w-2/5 flex items-center justify-center">
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
            <div
              className="h-12 px-4 text-sm md:text-base flex hover:rounded-full text-black border-b-2 border-gray-300 w-full cursor-pointer" key={"default"}
            >
              <div className="w-[8%] px-2 flex items-center justify-center">
                {admins.length + 1}
              </div>
              <div className="w-2/5 flex items-center">{credentials.email}</div>
              <div className="w-2/5 flex items-center justify-center">{credentials.password}</div>
              <div
                className="flex items-center"
              >
                Default
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default AdminsList;
