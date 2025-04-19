"use client";
import { useEffect, useState } from "react";
import AdminsList from "../../../components/AdminsList";

function Page() {
  const [admins, setAdmins] = useState([]);
  const [credentials, setCredentials] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/admin");
        result = await result.json();
        if (result.success) {
          setAdmins(result.admins);
          setCredentials(result.credentials);
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
        credentials={credentials}
      />
    </>
  );
}

export default Page;
