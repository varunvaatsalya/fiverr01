"use client";
import React, { useEffect, useState } from "react";
import Loading from "@/app/components/Loading";
import Navbar from "@/app/components/Navbar";
import NewIpdPatient from "@/app/components/NewIpdPatient";
import IpdAdmissionForm from "@/app/components/IpdAdmissionForm";
import { FaBars } from "react-icons/fa";

const SECTIONS = [
  "Add Ons",
  "Reason",
  "Insurence Details",
  "Bed Operations",
  "Supplementary Expenses",
  "Other Services",
  "IPD Invoice Summary",
  "Charges Payments Balance",
];

function Page({ params }) {
  const id = params.id;
  const [bed, setBed] = useState(null);
  const [patientsList, setPatientsList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch(`/api/admission?id=${id}`);
        result = await result.json();
        if (result.success) {
          setBed(result.bed);
          console.log(result.bed);
          setPatientsList(result.patientsList);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);

  if (!bed) {
    return (
      <div className="bg-black min-h-screen flex flex-col justify-center items-center text-white ">
        <Loading size={70} />
        <div className="text-3xl font-bold my-2">Loading</div>
        <div className="text-lg font-semibold">Bed Data</div>
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-svh h-screen">
      <Navbar route={["IPD", "Works"]} />
      {!bed.isOccupied ? (
        <NewIpdPatient patientsList={patientsList} bed={bed} setBed={setBed} />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col md:flex-row">
          <div className="bg-gray-800 md:h-full w-full md:w-1/5 flex flex-col relative z-50">
            <div
              className="flex justify-between items-center p-2 text-white z-50"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <div className="font-bold">IPD Works</div>
              <div className="md:hidden cursor-pointer">
                <FaBars />
              </div>
            </div>
            <div
              className={
                "w-full text-sm px-2 font-semibold overflow-hidden md:overflow-visible transition-[max-height] duration-300 ease-in-out bg-gray-800 text-white md:static md:block absolute top-full left-0 md:max-h-full " +
                (isOpen ? "max-h-[500px]" : "max-h-0")
              }
              onClick={() => setIsOpen(false)}
            >
              {SECTIONS.map((label, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedSection(index)}
                  className={`p-3 rounded-lg ${
                    selectedSection === index
                      ? "bg-gray-600"
                      : "hover:bg-gray-700"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div onClick={() => setIsOpen(false)} className="h-full w-full">
            <IpdAdmissionForm
              bed={bed}
              setBed={setBed}
              selectedSection={selectedSection}
              section={SECTIONS[selectedSection]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
