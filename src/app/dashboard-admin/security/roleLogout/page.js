"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import { formatDateTimeToIST } from "../../../utils/date";

const ROLES = [
  "default admin",
  "admin",
  "owner",
  "salesman",
  "nurse",
  "pathologist",
  "stockist",
  "dispenser",
];

function Page() {
  const [logouts, setLogouts] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/adminLogout");
        result = await result.json();
        if (result.success) {
          setLogouts(result.logs);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  async function logoutRole(role) {
    let confirm = window.confirm(
      "Do you want to logout all users of this role!"
    );
    if (!confirm) return;
    try {
      const response = await fetch(`/api/adminLogout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      const result = await response.json();
      if (result.success) {
        console.log(result.updatedDoc)
        setLogouts((prevLogouts) =>
          prevLogouts.map((docs) =>
            docs.role === role ? result.updatedDoc : docs
          )
        );
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }
  return (
    <div className="w-full flex flex-col items-center gap-1 min-h-screen">
      <div className="w-full">
        <Navbar route={["Security", "Role Logout"]} />
      </div>
      <div className="w-1/2 px-4 py-2 rounded-full bg-black text-white">
        Role Based Logouts
      </div>
      <div className="w-full md:w-3/4 lg:w-3/5 h-12 flex items-center rounded-full bg-black text-white">
        <div className="w-12 px-2 flex items-center justify-center">Sr.</div>
        <div className="flex-1 min-w-28 px-2">Role</div>
        <div className="flex-1 min-w-28 px-2 text-center">Last Logout</div>
        <div className="flex-1 min-w-28 px-2 text-center">Action</div>
      </div>
      {ROLES.map((role, index) => {
        let lastLogoutTime = logouts.find(
          (logout) => logout.role === role
        )?.lastLogoutAt;
        return (
          <div
            className="w-full md:w-3/4 lg:w-3/5 h-12 flex items-center hover:rounded-full text-black border-b-2 border-gray-300 cursor-pointer"
            key={index}
          >
            <div className="w-12 px-2 flex items-center justify-center">
              {index + 1 + "."}
            </div>
            <div className="flex-1 min-w-28 px-2 capitalize">{role}</div>
            <div className="flex-1 min-w-28 px-2 text-center">
              {lastLogoutTime ? formatDateTimeToIST(lastLogoutTime) : "--"}
            </div>
            <div className="flex-1 min-w-28 px-2 flex justify-center">
              <button
                onClick={() => {
                  logoutRole(role);
                }}
                className="py-1 px-2 text-white text-sm bg-red-700 hover:bg-red-800 rounded-lg font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Page;
