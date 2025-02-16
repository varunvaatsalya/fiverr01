"use client";
import { useEffect, useState } from "react";
import NurseList from "../../../components/NurseList";

function Page() {
  const [nurses, setNurses] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newNurse");
        result = await result.json();
        if (result.success) {
            setNurses(result.nurse);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  return (
    <>
      <NurseList nurses={nurses} setNurses={setNurses} />
    </>
  );
}

export default Page;
