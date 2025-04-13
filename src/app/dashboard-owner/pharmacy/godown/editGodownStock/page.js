"use client"
import React, { useEffect, useState } from "react";
import Navbar from "../../../../components/Navbar";
import EditStockForm from "../../../../components/EditStockForm";

function Page() {
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    fetch("/api/newMedicine?basicInfo=1")
      .then((res) => res.json())
      .then((data) => {
        setMedicines(data.response);
        console.log(data.response);
      });
  }, []);
  return (
    <div>
      <Navbar route={["Pharmacy", "GoDown", "Edit Stock"]} />
      <EditStockForm medicines={medicines} />
    </div>
  );
}

export default Page;
