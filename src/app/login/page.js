import React from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginComponent from "../components/loginComponent";

export default function Page() {
  
  return (
    <div className=" flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <main className="flex-grow mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 bg-gray-200 text-black flex items-center justify-center">
        <div className="max-w-3xl py-6 px-10 mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          <h2 className="text-3xl font-bold mb-2 text-center dark:text-gray-900">
            Register your Company
          </h2>
          <div className="text-lg text-gray-600 text-center">
            Please enter your Company Details
          </div>
          <LoginComponent />
        </div>
      </main>

      <Footer />
    </div>
  );
}
