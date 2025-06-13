import React from "react";
import Navbar from "@/app/components/Navbar";
import StockOffers from "@/app/components/StockOffers";

function Page() {
  return (
    <div>
      <Navbar route={["Godown", "Offers"]} />
      <StockOffers />
    </div>
  );
}

export default Page;
