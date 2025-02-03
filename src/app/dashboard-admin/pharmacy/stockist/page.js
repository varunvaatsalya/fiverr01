"use client";
import { useEffect, useState } from "react";
import SearchList from "../../../components/SearchList";

function Page() {
  const [stockist, setStockist] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newUsers?role=stockist");
        result = await result.json();
        if (result.success) {
          setStockist(result.users);
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
      <SearchList users={stockist} updateUsers={setStockist} role={'stockist'} accessInfo={accessInfo} />
    </>
  );
}

export default Page;
