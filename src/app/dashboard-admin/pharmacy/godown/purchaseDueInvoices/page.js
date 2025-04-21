import React from "react";
import Navbar from "../../../../components/Navbar";
import PurchaseHistory from "../../../../components/PurchaseHistory";

function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar route={["Pharmacy", "Payment Dues"]} />
      <PurchaseHistory/>
    </div>
  );
}

export default Page;
