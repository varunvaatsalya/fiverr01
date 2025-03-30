"use client";
import React, { useEffect, useState } from "react";
import ExpressBillSearchList from "../../components/ExpressBillSearchList";

function Page() {
  const [expressBill, setExpressBill] = useState([]);
  const [role, setRole] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditPermission, setIsEditPermission] = useState(false);

  useEffect(() => {
    async function fetchData(page) {
      try {
        let result = await fetch(`/api/newExpressBill?page=${page}`);
        result = await result.json();
        if (result.success) {
          setRole(result.userRole);
          setExpressBill(result.allExpressBill);
          setTotalPages(result.totalPages)
          setIsEditPermission(result.editPermission);
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
        isEditPermission={isEditPermission}
        setPage={setPage}
        totalPages={totalPages}
        expressBills={expressBill}
        setExpressBills={setExpressBill}
      />
    </>
  );
}

export default Page;
