"use client";
import { useEffect, useState } from "react";
import SearchList from "../../components/SearchList";

function Page() {
  const [salesMen, setSalesMen] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newUsers?role=salesman");
        result = await result.json();
        if (result.success) {
          setSalesMen(result.users);
          console.log(result.users, result)
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
      <SearchList
        users={salesMen}
        updateUsers={setSalesMen}
        role={"salesman"}
        accessInfo={accessInfo}
      />
    </>
  );
}

export default Page;
