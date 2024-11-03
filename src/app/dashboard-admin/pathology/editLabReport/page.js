"use client";
import React, { useEffect, useState } from "react";
import CompletedTestList from "../../../components/CompletedTestList"


function Page() {
  const [completedTests, setCompletedTests] = useState([]);
  // const [accessInfo, setAccessInfo] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchData(page) {
      try {
        let result = await fetch(`/api/updatePathoLabRes?page=${page}`);
        result = await result.json();
        if (result.success) {
          console.log(result.completedTests.length)
          setCompletedTests(result.completedTests);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData(page);
  }, [page]);
  return (
    <>
      <CompletedTestList
        page={page}
        setPage={setPage}
        completedTests={completedTests}
        setCompletedTests={setCompletedTests}
      />
    </>
  );
}

export default Page;
