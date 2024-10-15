"use client";
import React, { useEffect, useState } from "react";
import DepartmentSearchList from "../../components/DepartmentSearchList";

function Page() {
  const [departments, setDepartments] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/department");
        result = await result.json();
        if (result.success) {
          setDepartments(result.departments);
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
      <DepartmentSearchList
        departments={departments}
        setDepartments={setDepartments}
        accessInfo={accessInfo}
      />
    </>
  );
}

export default Page;
