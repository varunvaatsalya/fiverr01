"use client"
import { useEffect, useState } from "react";
import SearchList from "../../../components/SearchList";

function Page() {
  const [pathologists, setPathologists] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newUsers?role=pathologist");
        result = await result.json();
        if (result.success) {
          setPathologists(result.users);
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
      <SearchList users={pathologists} updateUsers={setPathologists} role={'pathologist'} accessInfo={accessInfo} />
    </>
  );
}

export default Page;

// 1
// jagat
// jagat@shivamakshayvat.in
// 24102014