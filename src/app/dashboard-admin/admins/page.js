"use client";
import { useEffect, useState } from "react";
import AdminsList from "../../components/AdminsList";

function Page() {
  const [admins, setAdmins] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/admin");
        result = await result.json();
        if (result.success) {
          setAdmins(result.admins);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  return (
    <>
      <AdminsList
        admins={admins}
        setAdmins={setAdmins}
      />
    </>
  );
}

export default Page;
