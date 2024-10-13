"use client";
import { useEffect, useState } from "react";
import SearchList from "../../components/SearchList";

function Page() {
  const [salesMen, setSalesMen] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newUsers?role=salesman");
        result = await result.json();
        if (result.success) {
          setSalesMen(result.users);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  return (
    <>
      <SearchList users={salesMen} updateUsers={setSalesMen} role={'salesman'} />
    </>
  );
}

export default Page;
