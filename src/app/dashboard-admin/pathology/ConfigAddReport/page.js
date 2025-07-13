"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import AddLabReportSection from "@/app/components/AddLabReportSection";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MdAssignmentAdd } from "react-icons/md";

function Page() {
  const [tests, setTests] = useState([]);
  const [newUserSection, setNewUserSection] = useState(false);

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
        <Navbar route={["Test Reports"]} />
        <main className="flex-grow">
          <div className="px-4 max-w-3xl mx-auto space-y-2">
            {/* Top bar: Add button + Header */}
            <div className="flex items-center justify-between gap-3 py-2">
              <div className="text-sm font-medium bg-black text-white px-4 py-1.5 rounded-full">
                Lab Reports Models
              </div>
              <Button
                onClick={() => setNewUserSection((prev) => !prev)}
                className="flex items-center gap-2 h-9 px-4 rounded-full text-sm font-medium"
              >
                <MdAssignmentAdd className="text-base" />
                Add
              </Button>
            </div>
            <div className="w-full space-y-2">
              {tests.map((test, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg px-4 py-2 text-sm shadow-sm"
                >
                  {/* Left Section */}
                  <div className="grid grid-cols-3 overflow-hidden flex-1">
                    <div className="w-full">
                      <span className="text-sm text-black dark:text-white font-medium truncate max-w-[200px]">
                        {test.name}
                      </span>
                      {test.isExternalReport && (
                        <Badge
                          variant="secondary"
                          className="bg-green-800 text-green-300 px-2 py-0.5 text-xs mx-2"
                        >
                          External
                        </Badge>
                      )}
                    </div>
                    <div className="text-black">₹{test.price}</div>
                    <div className="text-gray-600 dark:text-gray-300 truncate w-full">
                      {test.ltid}
                    </div>
                  </div>

                  {/* Right: Edit Button */}
                  <Link href={`ConfigAddReport/${test._id}`}>
                    <Button
                      variant="ghost"
                      className="rounded-full bg-white text-black dark:bg-white dark:text-black h-8 px-4 text-xs font-semibold hover:bg-gray-100"
                    >
                      Edit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Page;
