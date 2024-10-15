"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import AddUserSection from "./AddUserSection";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { IoPersonAdd } from "react-icons/io5";

function SearchList({ users, updateUsers, role, accessInfo }) {
  const [newUserSection, setNewUserSection] = useState(false);
  const [resData, setResData] = useState(users);

  useEffect(() => {
    setResData(users);
  }, [users]);

  function updatedata(query) {
    console.log(query);
    let filterRes = users.filter((user) => {
      let lowerCaseQuery = query.toLowerCase();
      return (
        user.uid.toLowerCase().includes(lowerCaseQuery) ||
        user.name.toLowerCase().includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery) ||
        user.password.toLowerCase().includes(lowerCaseQuery)
      );
    });
    setResData(filterRes);
  }
  return (
    <>
      {newUserSection ? (
        <AddUserSection
          setNewUserSection={setNewUserSection}
          role={role}
          updateUsers={updateUsers}
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
                className="h-full w-full my-3 text-black text-xl font-medium px-4 rounded-full outline-none bg-gray-300 border-b-2 border-gray-400 focus:bg-gray-400"
              />
              {accessInfo?.accessRole === "admin" && (
                <button
                  onClick={() => {
                    setNewUserSection((newUserSection) => !newUserSection);
                  }}
                  className="flex justify-center items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 h-full rounded-full font-semibold"
                >
                  <IoPersonAdd />
                  <div>Add</div>
                </button>
              )}
            </div>
            <div className="h-12 flex rounded-full bg-black text-white">
              <div className="w-2/5 md:w-1/5 px-2 flex items-center justify-center">
                UID
              </div>
              <div className="w-2/5 md:w-1/5 px-2 flex items-center">Name</div>
              <div className="w-2/5 px-2 flex items-center max-md:hidden">
                Email
              </div>
              <div className="w-1/5 flex items-center justify-center">
                Edit Access
              </div>
            </div>
            {resData.map((user) => {
              return (
                <Link
                  href="#"
                  className="h-12 flex hover:rounded-full text-black border-b-2 border-gray-300 hover:bg-gray-300"
                  key={user.uid}
                >
                  <div className="w-2/5 md:w-1/5 px-2 flex items-center justify-center">
                    {user.uid}
                  </div>
                  <div className="w-2/5 md:w-1/5 px-2 flex items-center">
                    {user.name}
                  </div>
                  <div className="w-2/5 px-2 flex items-center max-md:hidden">
                    {user.email}
                  </div>
                  <div className="w-1/5 flex items-center justify-center">
                    {user.role == "salesman" && user.editPermission
                      ? "Edit Access"
                      : ""}
                  </div>
                </Link>
              );
            })}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default SearchList;
