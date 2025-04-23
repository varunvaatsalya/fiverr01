import React from "react";
import Navbar from "../../../../components/Navbar";
import StockOrderHistory from "../../../../components/StockOrderHistory";

function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar route={["Pharmacy", "Order History"]} />
      <StockOrderHistory />
    </div>
  );
}

export default Page;
