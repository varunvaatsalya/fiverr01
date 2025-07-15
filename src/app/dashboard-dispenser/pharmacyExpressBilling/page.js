"use client";
import React, { useEffect, useState } from "react";
import ExpressBillSearchList from "@/app/components/ExpressBillSearchList";

function Page() {
  const [expressBill, setExpressBill] = useState([]);
  const [role, setRole] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    async function fetchData(page) {
      try {
        let result = await fetch(`/api/newExpressBill?page=${page}`);
        result = await result.json();
        if (result.success) {
          setExpressBill(result.allExpressBill);
          setRole(result.userRole);
          setTotalPages(result.totalPages)
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData(page);
  }, [page]);
  return (
    <>
      <ExpressBillSearchList
        page={page}
        role={role}
        setPage={setPage}
        totalPages={totalPages}
        expressBills={expressBill}
        setExpressBills={setExpressBill}
      />
    </>
  );
}

export default Page;
