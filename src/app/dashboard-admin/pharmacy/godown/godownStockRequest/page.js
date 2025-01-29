"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../../components/Navbar";
import StockRequest from "../../../../components/StockRequest";

function Page() {
  const [stockRequest, setStockRequests] = useState([]);
  useEffect(() => {
    fetch("/api/stockRequest")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStockRequests(data.requests);
        } else console.log(data.message);
      });
  }, []);
  return (
    <div>
      <Navbar route={["Pharmacy", "GoDown", "Stock Request"]} />
      <StockRequest stockRequest={stockRequest} setStockRequests={setStockRequests} />
    </div>
  );
}

export default Page;
