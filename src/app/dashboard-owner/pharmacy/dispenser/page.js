"use client";
import { useEffect, useState } from "react";
import SearchList from "../../../components/SearchList";

function Page() {
  const [dispenser, setDispenser] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newUsers?role=dispenser");
        result = await result.json();
        if (result.success) {
          setDispenser(result.users);
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
      <SearchList users={dispenser} updateUsers={setDispenser} role={'dispenser'} accessInfo={accessInfo} />
    </>
  );
}

export default Page;
