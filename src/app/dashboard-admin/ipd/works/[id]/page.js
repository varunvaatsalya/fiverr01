"use client";
import React, { useEffect, useState } from "react";
import Loading from "../../../../components/Loading";
import Navbar from "../../../../components/Navbar";
import { FaCircleLeft } from "react-icons/fa6";
import NewIpdPatient from "../../../../components/NewIpdPatient";
import AdmissionForm from "../../../../components/AdmissionForm";
import Link from "next/link";

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

function Page({ params }) {
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
        {!bed.isOccupied ? (
          <NewIpdPatient
            patientsList={patientsList}
            bed={bed}
            setBed={setBed}
          />
        ) : (
          <>
            <AdmissionForm bed={bed} setBed={setBed} />
          </>
        )}
    </div>
  );
}

export default Page;
