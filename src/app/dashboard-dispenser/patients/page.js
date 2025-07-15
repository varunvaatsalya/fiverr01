"use client";
import React, { useEffect, useState } from "react";
import PatientSearchList from "@/app/components/PatientSearchList";


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
