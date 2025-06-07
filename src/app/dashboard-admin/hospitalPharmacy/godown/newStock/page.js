"use client";
import React, { useEffect, useState } from 'react'
import Navbar from '@/app/components/Navbar';
import NewStockForm from '@/app/components/NewStockForm';


function Page() {
  const [medicines, setMedicines] = useState([]);
  const [ids, setIds] = useState([]);
  
    useEffect(() => {
      fetch("/api/newMedicine?basicInfo=1&sectionType=hospital")
        .then((res) => res.json())
        .then((data) => {
          setMedicines(data.response);
          setIds(data.ids);
        });
    }, []);
  return (
    <div>
      <Navbar route={["Hospital", "GoDown", "New Stock"]} />
      <NewStockForm medicines={medicines} ids={ids} />
    </div>
  )
}

export default Page
