"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import MedicineDistribution from "../../components/MedicineDistribution";

function Page() {
  const [invoices, setInvoices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [accessInfo, setAccessInfo] = useState({
    accessRole: "",
    accessEditPermission: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch(`/api/newPharmacyInvoice?pending=1`);
        result = await result.json();
        if (result.success) {
          console.log(1212, result);
          setInvoices(result.allPharmacyInvoices);
          setTotalPages(result.totalPages);
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
    <div>
      <Navbar route={["Pharmacy", "Dispensary"]} />
      <MedicineDistribution invoices={invoices} setInvoices={setInvoices} />
    </div>
  );
}

export default Page;
