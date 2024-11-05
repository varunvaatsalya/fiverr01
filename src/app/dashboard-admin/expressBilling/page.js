"use client";
import React, { useEffect, useState } from "react";
import DataEntrySearchList from "../../components/DataEntrySearchList";

function Page() {
  const [dataEntry, setDataEntry] = useState([]);
  const [role, setRole] = useState(null);
  const [page, setPage] = useState(1);
  useEffect(() => {
    async function fetchData(page) {
      try {
        let result = await fetch(`/api/newDataEntry?page=${page}`);
        result = await result.json();
        if (result.success) {
          setDataEntry(result.allDataEntry);
          setRole(result.userRole);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData(page);
  }, [page]);
  return (
    <>
      <DataEntrySearchList
        page={page}
        role={role}
        setPage={setPage}
        dataEntrys={dataEntry}
        setDataEntrys={setDataEntry}
      />
    </>
  );
}

export default Page;
