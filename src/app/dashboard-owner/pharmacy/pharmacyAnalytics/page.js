"use client";
import React, { useEffect, useState } from "react";
import AnalyticsPharmacy from "../../../components/AnalyticsPharmacy";
import Loading from "../../../components/Loading";

function Page() {
  const [pharmacyInvoices, setPharmacyInvoices] = useState(null);
  useEffect(() => {
    async function fetchPharmacyInvoices() {
      try {
        let result = await fetch("/api/analyticsPharmacy");
        result = await result.json();
        if (result.success) {
          setPharmacyInvoices(result.pharmacyInvoices);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchPharmacyInvoices();
  }, []);

  if (!pharmacyInvoices) {
    return (
      <div className="min-h-screen bg-slate-900 w-full flex flex-col justify-center items-center">
        <Loading size={50} />
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <AnalyticsPharmacy
        pharmacyInvoices={pharmacyInvoices}
        setPharmacyInvoices={setPharmacyInvoices}
      />
    </>
  );
}

export default Page;
