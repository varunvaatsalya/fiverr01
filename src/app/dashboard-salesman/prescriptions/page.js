"use client";
import React, { useEffect, useState } from "react";
import PrescriptionsSearchList from "../../components/PrescriptionsSearchList";

const prescriptions1 = [
  {
    pid: 1245,
    patient: { name: "varun gupta", uhid: 125478 },
    doctor: { name: "varun gupta" },
    department: { name: "nurology" },
    items: [
      { name: "x-ray", price: 125 },
      { name: "ct-scan", price: 215 },
    ],
    createdAt: "2024-10-12T15:39:20.000+00:00",
  },
  {
    pid: 1245,
    patient: { name: "varun gupta", uhid: 125478 },
    doctor: { name: "shiv shankar" },
    department: { name: "brianology" },
    items: [
      { name: "x-ray", price: 125 },
      { name: "ct-scan", price: 215 },
    ],
    createdAt: "2024-10-15T15:39:20.000+00:00",
  },
  {
    pid: 1245,
    patient: { name: "varun gupta", uhid: 125478 },
    doctor: { name: "varun gupta" },
    department: { name: "nurology" },
    items: [
      { name: "x-ray", price: 125 },
      { name: "ct-scan", price: 215 },
    ],
    createdAt: "2024-10-12T15:39:20.000+00:00",
  },
];

function Page() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newPrescription");
        result = await result.json();
        if (result.success) {
          setPrescriptions(result.allPrescription);
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
      <PrescriptionsSearchList
        prescriptions={prescriptions}
        setPrescriptions={setPrescriptions}
        accessInfo={accessInfo}
      />
    </>
  );
}

export default Page;
