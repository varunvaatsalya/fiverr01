"use client"
import { useEffect, useState } from "react";
import SearchList from "../../components/SearchList";

function page() {
  const [owners, setOwners] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newUsers?role=owner");
        result = await result.json();
        if (result.success) {
          setOwners(result.users);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  return (
    <>
      <SearchList users={owners} updateUsers={setOwners} role={'owner'} />
    </>
  );
}

export default page;
