"use client"
import React, { useEffect, useState } from "react";
import DepartmentSearchList from "../../components/DepartmentSearchList";

// const deptData = [
//   {
//     _id:1234,
//     name: "nurology",
//     items: [
//       { name: "x-ray", price: 150 },
//       { name: "ultrasound", price: 150 },
//       { name: "abcd", price: 150 },
//       { name: "absc", price: 150 },
//     ],
//   },
//   {
//     _id:1235,
//     name: "dermatology",
//     items: [
//       { name: "x-ray", price: 150 },
//       { name: "ultrasound", price: 150 },
//       { name: "abcd", price: 150 },
//       { name: "absc", price: 150 },
//     ],
//   },
//   {
//     _id:1236,
//     name: "nurologyY",
//     items: [
//       { name: "x-ray", price: 150 },
//       { name: "ultrasound", price: 150 },
//       { name: "abcd", price: 150 },
//       { name: "absc", price: 150 },
//       { name: "nidhi", price: 2 },
//       { name: "nidhiw", price: 21 },
//     ],
//   },
// ]


function page() {
  const [departments, setDepartments] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/department");
        result = await result.json();
        if (result.success) {
          setDepartments(result.departments);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  return (
    <>
      <DepartmentSearchList departments={departments} setDepartments={setDepartments} />
    </>
  );
}

export default page;
