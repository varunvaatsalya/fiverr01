"use client"
import React, { useEffect, useState } from "react";
import DepartmentSearchList from "../../components/DepartmentSearchList";



function page() {
  const [departments, setDepartments] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/department");
        result = await result.json();
        if (result.success) {
          setDepartments(result.departments);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  return (
    <>
      <DepartmentSearchList departments={departments} setDepartments={setDepartments} />
    </>
  );
}

export default page;
