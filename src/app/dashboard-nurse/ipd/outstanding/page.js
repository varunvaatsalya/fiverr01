"use client";
import React, { useEffect, useState } from "react";
import AdmissionsSearchList from "../../../components/AdmissionsSearchList";

function Page() {
  const [admissions, setAdmissions] = useState([]);
  const [page, setPage] = useState(1);
  useEffect(() => {
    async function fetchData(page) {
      try {
        let result = await fetch(`/api/ipdRecords?page=${page}&isCompleted=1`);
        result = await result.json();
        if (result.success) {
          setAdmissions(result.allAdmission);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData(page);
  }, [page]);
  return (
    <>
      <AdmissionsSearchList
        tag={"IPD Outstanding Patient"}
        link={'outstanding'}
        page={page}
        setPage={setPage}
        admissions={admissions}
        setAdmissions={setAdmissions}
      />
    </>
  );
}

export default Page;
