import React from "react";
import Navbar from "@/app/components/Navbar";
import StockOrderHistory from "@/app/components/StockOrderHistory";

function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar route={["Hospital", "Order History"]} />
      <StockOrderHistory />
    </div>
  );
}

export default Page;
