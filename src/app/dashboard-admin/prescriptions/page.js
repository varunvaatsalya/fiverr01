"use client";
import React, { useEffect, useState } from "react";
import PrescriptionsSearchList from "../../components/PrescriptionsSearchList";

function Page() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  useEffect(() => {
    async function fetchData(page) {
      try {
        let result = await fetch(`/api/newPrescription?page=${page}`);
        result = await result.json();
        if (result.success) {
          setPrescriptions(result.allPrescription);
          setTotalPages(result.totalPages);
          setAccessInfo({
            accessRole: result.userRole,
            accessEditPermission: result.userEditPermission,
          });
          console.log(result.allPrescription)
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData(page);
  }, [page]);
  return (
    <>
      <PrescriptionsSearchList
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        prescriptions={prescriptions}
        setPrescriptions={setPrescriptions}
        accessInfo={accessInfo}
      />
    </>
  );
}

export default Page;
