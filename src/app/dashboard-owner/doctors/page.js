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
  const [accessInfo, setAccessInfo] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newDoctor");
        result = await result.json();
        if (result.success) {
          setDoctors(result.doctors);
          setAccessInfo({
            accessRole: result.userRole,
            accessEditPermission: result.userEditPermission,
          });
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  return (
    <>
      <DoctorSearchList
        doctors={doctors}
        setDoctors={setDoctors}
        accessInfo={accessInfo}
      />
    </>
  );
}

export default Page;
