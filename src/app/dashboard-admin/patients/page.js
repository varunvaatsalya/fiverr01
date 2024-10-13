"use client";
import React, { useEffect, useState } from "react";
import PatientSearchList from "../../components/PatientSearchList";

const dummydoctors = [
  {
    _id: "ndcejdbehj356",
    name: "manik chandra",
    uhid: "1254789653214",
    age:21,
    gender:"male",
    aadharNumber:125478966321,
    mobileNumber:9855789632,
    address:"sector-F, Jankipuram, Lucknow",
    date:"27 sep, 2024"
  },
  {
    _id: "ndcejdbehj356",
    name: "manik chandra",
    uhid: "1254789653214",
    age:21,
    gender:"male",
    aadharNumber:125478966321,
    mobileNumber:9855789632,
    address:"sector-F, Jankipuram, Lucknow",
    date:"27 sep, 2024"
  },
  {
    _id: "ndcejdbehj356",
    name: "manik chandra",
    uhid: "1254789653214",
    age:21,
    gender:"male",
    aadharNumber:125478966321,
    mobileNumber:9855789632,
    address:"sector-F, Jankipuram, Lucknow",
    date:"27 sep, 2024"
  },
  {
    _id: "ndcejdbehj356",
    name: "manik chandra",
    uhid: "1254789653214",
    age:21,
    gender:"male",
    aadharNumber:125478966321,
    mobileNumber:9855789632,
    address:"sector-F, Jankipuram, Lucknow",
    date:"27 sep, 2024"
  },
  {
    _id: "ndcejdbehj356",
    name: "manik chandra",
    uhid: "1254789653214",
    age:21,
    gender:"male",
    aadharNumber:125478966321,
    mobileNumber:9855789632,
    address:"sector-F, Jankipuram, Lucknow",
    date:"27 sep, 2024"
  },
  {
    _id: "ndcejdbehj356",
    name: "manik chandra",
    uhid: "1254789653214",
    age:21,
    gender:"male",
    aadharNumber:125478966321,
    mobileNumber:9855789632,
    address:"sector-F, Jankipuram, Lucknow",
    date:"27 sep, 2024"
  },
  
];

function Page() {
  const [patients, setPatients] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newPatient");
        result = await result.json();
        if (result.success) {
          setPatients(result.patients);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  return (
    <>
      <PatientSearchList patients={patients} setPatients={setPatients} />
    </>
  );
}

export default Page;
