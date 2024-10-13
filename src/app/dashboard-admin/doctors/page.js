"use client";
import React, { useEffect, useState } from "react";
import DoctorSearchList from "../../components/DoctorSearchList";

const dummydoctors = [
  {
    name: "manik chandra",
    specialty: "abcd",
    department: "nurology",
    date: "29 sep 2024",
  },
  {
    name: "manik chandra",
    specialty: "abcd",
    department: "nurology",
    date: "29 sep 2024",
  },
  {
    name: "manik chandra",
    specialty: "abcd",
    department: "nurology",
    date: "29 sep 2024",
  },
  {
    name: "manik chandra",
    specialty: "abcd",
    department: "nurology",
    date: "29 sep 2024",
  },
  {
    name: "manik chandra",
    specialty: "abcd",
    department: "nurology",
    date: "29 sep 2024",
  },
  {
    name: "manik chandra",
    specialty: "abcd",
    department: "nurology",
    date: "29 sep 2024",
  },
  {
    name: "manik chandra",
    specialty: "abcd",
    department: "nurology",
    date: "29 sep 2024",
  },
];

function Page() {
  const [doctors, setDoctors] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newDoctor");
        result = await result.json();
        if (result.success) {
          setDoctors(result.doctors);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  return (
    <>
      <DoctorSearchList doctors={doctors} setDoctors={setDoctors} />
    </>
  );
}

export default Page;
