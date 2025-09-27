import React from "react";
import Navbar from "@/app/components/Navbar";
import PurchaseHistory from "@/app/components/PharmacyDueInvoice";

function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-200">
      <Navbar route={["Hospital", "Payment Dues"]} />
      <div className="p-2">
        <PurchaseHistory />
      </div>
    </div>
  );
}

export default Page;
