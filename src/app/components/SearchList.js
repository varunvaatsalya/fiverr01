"use client";
import React, { useEffect, useState } from "react";
import AddUserSection from "./AddUserSection";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { IoPersonAdd } from "react-icons/io5";
import { formatDateTimeToIST } from "../utils/date";

function SearchList({ users, updateUsers, role, accessInfo }) {
  const [newUserSection, setNewUserSection] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [resData, setResData] = useState(users);
  const [editUserId, setEditUserId] = useState(null);

  useEffect(() => {
    setResData(users);
  }, [users]);

  function updatedata(query) {
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
  async function removeUser(id) {
    let confirm = window.confirm("Do you want to delete this user!");
    if (!confirm) return;
    try {
      const response = await fetch(`/api/newUsers`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (result.success) {
        setActiveIndex(null);
        updateUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }
  async function logoutUser(id) {
    let confirm = window.confirm("Do you want to logout this user!");
    if (!confirm) return;
    try {
      const response = await fetch(`/api/newUsers/logout`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (result.success) {
        updateUsers((prevUsers) =>
          prevUsers.map((user) => (user._id === id ? result.user : user))
        );
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }

  return (
    <>
      {newUserSection ? (
        <AddUserSection
          setNewUserSection={setNewUserSection}
          role={role}
          updateUsers={updateUsers}
          editUserId={editUserId}
        />
      ) : (
        <></>
      )}
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar route={[role]} />
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
            {resData.map((user, index) => {
              return (
                <div key={index}>
                  <div
                    onClick={() =>
                      setActiveIndex(activeIndex === index ? null : index)
                    }
                    className="h-12 flex hover:rounded-full text-black border-b-2 border-gray-300 hover:bg-gray-300 cursor-pointer"
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
                      {user.editPermission ? "Edit Access" : ""}
                    </div>
                  </div>
                  {activeIndex === index && (
                    <div className="w-full px-3 py-3 bg-gray-200 rounded-b-xl text-center flex flex-wrap items-center gap-2">
                      <div className=" w-full font-bold text-black">
                        Password:{" "}
                        <span className="text-red-500">{user.password}</span>
                      </div>
                      <div className="w-full flex justify-between items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              removeUser(user._id);
                            }}
                            className="py-2 px-4 text-red-700 border border-red-700 rounded-lg font-semibold flex gap-1 items-center"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => {
                              logoutUser(user._id);
                            }}
                            disabled={
                              user.logout && user.logout.isLogoutPending
                            }
                            className="py-2 px-4 text-white bg-red-700 disabled:bg-gray-600 rounded-lg font-semibold flex gap-1 items-center"
                          >
                            {user.logout && user.logout.isLogoutPending
                              ? "Logout Pending..."
                              : "Logout"}
                          </button>
                          {user.logout && user.logout.lastLogoutByAdmin && (
                            <div className="text-sm text-gray-700">
                              Last Logout by admin:{" "}
                              <span className="text-red-600">
                                {formatDateTimeToIST(
                                  user.logout.lastLogoutByAdmin
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setEditUserId(user._id);
                            setNewUserSection((newUserSection) => !newUserSection);
                          }}
                          className="py-2 px-4 text-white bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold flex gap-1 items-center"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
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

export default SearchList;
