"use client"
import { useEffect, useState } from "react";
import SearchList from "../../../components/SearchList";

function Page() {
  const [nurses, setNurses] = useState([]);
  const [accessInfo, setAccessInfo] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newUsers?role=nurse");
        result = await result.json();
        if (result.success) {
          setNurses(result.users);
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
      <SearchList users={nurses} updateUsers={setNurses} role={'nurse'} accessInfo={accessInfo} />
    </>
  );
}

export default Page;

// 1
// Vijay Pratap
// Vijay@shivamakshayvat.in
// Vijay@ShivamAkshayvat
// 2
// Rajnish Chaturvedi
// rajnishchaturvedi@shivamakshayvat.in
// rajchaube@8840871630
// 3
// Ajay
// Ajay@shivamakshayvat.in
// Ajay@123