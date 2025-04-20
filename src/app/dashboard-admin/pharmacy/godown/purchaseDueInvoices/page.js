import React from "react";
import Navbar from "../../../../components/Navbar";

function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar route={["Pharmacy", "Payment Dues"]} />
    </div>
  );
}

export default Page;
