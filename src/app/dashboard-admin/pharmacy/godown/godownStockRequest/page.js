"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import StockRequest from "@/app/components/StockRequest";

function Page() {
  const [stockRequest, setStockRequests] = useState([]);
  const [approvedStockRequest, setApprovedStockRequests] = useState([]);
  useEffect(() => {
    fetch("/api/stockRequest?pending=1")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const pendingRequests = data.requests.filter(
            (req) => req.status === "Pending"
          );
          const approvedRequests = data.requests.filter(
            (req) => req.status === "Approved"
          );

          setStockRequests(pendingRequests);
          setApprovedStockRequests(approvedRequests);
        } else console.log(data.message);
      });
  }, []);
  return (
    <div>
      <Navbar route={["Pharmacy", "GoDown", "Stock Request"]} />
      <StockRequest
        stockRequest={stockRequest}
        setStockRequests={setStockRequests}
        approvedStockRequest={approvedStockRequest}
        setApprovedStockRequests={setApprovedStockRequests}
      />
    </div>
  );
}

export default Page;
