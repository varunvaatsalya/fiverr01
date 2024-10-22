"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { IoPersonAdd } from "react-icons/io5";
import AddLabReportSection from "../../../components/AddLabReportSection";
import Link from "next/link";

function page() {
  const [tests, setTests] = useState([]);
  const [newUserSection, setNewUserSection] = useState(false);

  const tests1 = [
    { name: "blood test", _id: "14fvsd", ltid:'yebdjh', price:200 },
    { name: "liver test", _id: "15sdvds", ltid:'yebdjh', price:200 },
    { name: "urine test", _id: "18fscevsd", ltid:'yebdjh', price:200 },
    { name: "hand test", _id: "betb14fvsd", ltid:'yebdjh', price:200 },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/pathologyLabTest");
        result = await result.json();
        if (result.success) {
          setTests(result.pathologyLabTest);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      {newUserSection ? (
        <AddLabReportSection
          setNewUserSection={setNewUserSection}
          setTests={setTests}
        />
      ) : (
        <></>
      )}
      <div className="flex flex-col min-h-screen bg-gray-200">
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
            <div className=" w-1/2 py-3 text-lg font-bold mx-auto text-center rounded-full bg-black text-white">
              Lab Reports Models
            </div>
            <div className="flex flex-wrap justify-center w-full gap-3 p-3">
              {tests.map((test, index) => {
                return (
                  <Link
                    href={`ConfigAddReport/${test._id}`}
                    className="py-4 w-full md:w-2/5 text-sm font-semibold text-center rounded-xl bg-black hover:bg-gray-900 text-white"
                    key={index}
                  >
                    <div>{test.ltid}</div>
                    <div className="text-2xl font-bold capitalize">{test.name+', '+test.price+'/-'}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default page;
