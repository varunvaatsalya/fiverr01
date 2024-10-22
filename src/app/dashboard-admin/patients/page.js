"use client";
import React, { useEffect, useState } from "react";
import PatientSearchList from "../../components/PatientSearchList";

const dummydoctors = [
  {
    _id: "ndcejdbehj356",
    name: "manik chandra",
    uhid: "1254789653214",
    age: 21,
    gender: "male",
    aadharNumber: 125478966321,
    mobileNumber: 9855789632,
    address: "sector-F, Jankipuram, Lucknow",
    date: "27 sep, 2024",
  },
  {
    _id: "ndcejdbehj356",
    name: "manik chandra",
    uhid: "1254789653214",
    age: 21,
    gender: "male",
    aadharNumber: 125478966321,
    mobileNumber: 9855789632,
    address: "sector-F, Jankipuram, Lucknow",
    date: "27 sep, 2024",
  },
  {
    _id: "ndcejdbehj356",
    name: "manik chandra",
    uhid: "1254789653214",
    age: 21,
    gender: "male",
    aadharNumber: 125478966321,
    mobileNumber: 9855789632,
    address: "sector-F, Jankipuram, Lucknow",
    date: "27 sep, 2024",
  },
  {
    _id: "ndcejdbehj356",
    name: "manik chandra",
    uhid: "1254789653214",
    age: 21,
    gender: "male",
    aadharNumber: 125478966321,
    mobileNumber: 9855789632,
    address: "sector-F, Jankipuram, Lucknow",
    date: "27 sep, 2024",
  },
  {
    _id: "ndcejdbehj356",
    name: "manik chandra",
    uhid: "1254789653214",
    age: 21,
    gender: "male",
    aadharNumber: 125478966321,
    mobileNumber: 9855789632,
    address: "sector-F, Jankipuram, Lucknow",
    date: "27 sep, 2024",
  },
  {
    _id: "ndcejdbehj356",
    name: "manik chandra",
    uhid: "1254789653214",
    age: 21,
    gender: "male",
    aadharNumber: 125478966321,
    mobileNumber: 9855789632,
    address: "sector-F, Jankipuram, Lucknow",
    date: "27 sep, 2024",
  },
];

function Page() {
  const [patients, setPatients] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function fetchData(page) {
      try {
        let result = await fetch(`/api/newPatient?page=${page}`);
        result = await result.json();
        if (result.success) {
          setPatients(result.patients);
          setTotalPages(result.totalPages);
          setAccessInfo({
            accessRole: result.userRole,
            accessEditPermission: result.userEditPermission,
          });
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData(page);
  }, [page]);
  return (
    <>
      <PatientSearchList
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        patients={patients}
        setPatients={setPatients}
        accessInfo={accessInfo}
      />
    </>
  );
}

export default Page;
