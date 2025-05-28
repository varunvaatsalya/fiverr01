"use client";
import React, { useState } from "react";
import NewPharmacyInvoice from "@/app/components/NewPharmacyInvoice";
import Navbar from "@/app/components/Navbar";
import InvoicePharmacy from "@/app/components/InvoicePharmacy";

function Page() {
  const [printInvoice, setPrintInvoice] = useState(false);

  if (printInvoice) {
    return (
      <>
        <div className="bg-white h-full">
          <InvoicePharmacy
            printInvoice={printInvoice}
            setPrintInvoice={setPrintInvoice}
          />
        </div>
      </>
    );
  }
  return (
    <div className="bg-gray-950 min-h-screen">
      <Navbar route={["Pharmacy", "Add"]} />
      <div className="py-4">
        <NewPharmacyInvoice setPrintInvoice={setPrintInvoice} />
      </div>
    </div>
  );
}

export default Page;
