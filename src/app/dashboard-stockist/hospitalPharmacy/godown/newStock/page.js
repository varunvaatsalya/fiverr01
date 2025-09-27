"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import NewStockForm from "@/app/components/NewStockForm";

function Page() {

  const [medicines, setMedicines] = useState([]);
  const [lists, setLists] = useState([]);
  const [uniqueID, setUniqueID] = useState(null);
  const [type, setType] = useState("vendor");

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch(
          `/api/newPurchaseInvoice?sectionType=hospital&sourceType=${type}${
            medicines.length === 0 ? "&medicinesDetails=1" : ""
          }${!uniqueID ? "&generateNewId=1" : ""}`
        );
        result = await result.json();
        if (result.success) {
          setLists(result.response.lists);
          if (result.response.medicines)
            setMedicines(result.response.medicines || []);
          if (result.response.uniqueID) setUniqueID(result.response.uniqueID);
        } else {
          setMessage(result.message);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, [type]);
  return (
    <div className="bg-white min-h-screen">
      <Navbar route={["GoDown", "New Stock"]} />
      <NewStockForm
        medicines={medicines}
        lists={lists}
        type={type}
        setType={setType}
        uniqueID={uniqueID}
        setUniqueID={setUniqueID}
      />
    </div>
  );
}

export default Page;
