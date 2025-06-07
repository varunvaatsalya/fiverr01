"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import StockRequest from "@/app/components/StockRequest";

function Page() {
  const [stockRequest, setStockRequests] = useState([]);
  useEffect(() => {
    fetch("/api/stockRequest?pending=1&sectionType=hospital")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStockRequests(data.requests);
        } else console.log(data.message);
      });
  }, []);
  return (
    <div>
      <Navbar route={["Hospital", "GoDown", "Stock Request"]} />
      <StockRequest stockRequest={stockRequest} setStockRequests={setStockRequests} />
    </div>
  );
}

export default Page;
