"use client"
import { useEffect, useState } from "react";
import SearchList from "../../../components/SearchList";

function Page() {
  const [owners, setOwners] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newUsers?role=owner");
        result = await result.json();
        if (result.success) {
          setOwners(result.users);
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
      <SearchList users={owners} updateUsers={setOwners} role={'owner'} accessInfo={accessInfo} />
    </>
  );
}

export default Page;
