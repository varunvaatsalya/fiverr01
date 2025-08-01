"use client";
import React from "react";
import { useAuth } from "@/app/context/AuthContext";
import { FaRegUserCircle } from "react-icons/fa";
import { BiLoaderCircle } from "react-icons/bi";

function LoggedInUser() {
  const { user, loading } = useAuth();
  return (
    <div className="flex items-center justify-end gap-1 max-w-1/3 md:px-3 lg:px-6">
      <FaRegUserCircle className="size-4" />
      {loading ? (
        <BiLoaderCircle className="size-4 animate-spin" />
      ) : (
        <div className="font-semibold text-nowrap line-clamp-1 ">
          {user && user.name ? user.name : "User"}
        </div>
      )}
    </div>
  );
}

export default LoggedInUser;
