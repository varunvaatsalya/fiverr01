"use client";
import { useEffect, useState } from "react";
import PathologistList from "../../components/PathologistList";

function Page() {
  const [pathologists, setPathologists] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/newPathologist");
        result = await result.json();
        if (result.success) {
            setPathologists(result.pathologist);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  return (
    <>
      <PathologistList pathologists={pathologists} setPathologists={setPathologists} />
    </>
  );
}

export default Page;
