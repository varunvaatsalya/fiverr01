"use client";
import React, { useEffect, useState } from "react";
import Loading from "../../../../components/Loading";
import Navbar from "../../../../components/Navbar";
import { FaCircleLeft } from "react-icons/fa6";
import NewIpdPatient from "../../../../components/NewIpdPatient";
import AdmissionForm from "../../../../components/AdmissionForm";

let details = {
  ward: { name: "icu" },
  bedName: "icu1",
  isOccupied: true,
  price: 145,
  occupancy: {
    patientId: { name: "varun", uhid: "pt1254" },
    startDate: "145245874",
  },
};

function page({ params }) {
  const id = params.id;
  const [bed, setBed] = useState(null);
  const [patientsList, setPatientsList] = useState([]);

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
    <div>
      <Navbar route={["IPD", "Works"]} />
      <div className="flex justify-between items-center px-2 md:px-4">
        <a href="./"><div className="bg-slate-800 hover:bg-slate-950 py-3 px-5 rounded-full">
          <FaCircleLeft className="size-8" />
        </div></a>
        <div className="bg-slate-800 my-2 flex justify-center gap-4 py-3 w-full font-bold text-2xl rounded-full mx-auto md:w-3/4 lg:w-1/2">
          <div className="">
            Ward: <span className="text-blue-500">{bed.ward.name}</span>
          </div>
          <div className="">
            Bed: <span className="text-blue-500">{bed.bedName}</span>
          </div>
        </div>
        <div className="px-5 md:px-10"></div>
      </div>
      {!bed.isOccupied ? (
        <NewIpdPatient patientsList={patientsList} bed={bed} setBed={setBed} />
      ) : (
        <>
          <AdmissionForm bed={bed} setBed={setBed} />
        </>
      )}
    </div>
  );
}

export default page;
