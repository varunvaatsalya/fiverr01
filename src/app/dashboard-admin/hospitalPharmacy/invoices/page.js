import React from "react";
import Navbar from "@/app/components/Navbar";
import HospitalPharmacyInvoice from "@/app/components/HospitalPharmacyInvoice";

function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar route={["Hospital", "Invoices"]} />
      <HospitalPharmacyInvoice />
    </div>
  );
}

export default Page;
