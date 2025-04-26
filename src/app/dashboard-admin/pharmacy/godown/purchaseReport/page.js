"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../../components/Navbar";
import MedicinePurchaseReport from "../../../../components/MedicinePurchaseReport";
import { showError } from "../../../../utils/toast";

function Page() {
  const [payload, setPayload] = useState({
    startDate: "",
    endDate: "",
    vendorId: "",
    saltId: "",
    manufacturerId: "",
  });
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/newPurchaseInvoice/purchaseDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setPurchaseData(data.reports);
    } catch (error) {
      console.error("Error fetching data:", error);
      showError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full min-h-screen h-screen flex flex-col items-center">
      <div className="w-full">
        <Navbar route={["Godown", "Purchase Report"]} />
      </div>
      <MedicinePurchaseReport
        payload={payload}
        setPayload={setPayload}
        purchaseData={purchaseData}
        loading={loading}
        fetchData={fetchData}
      />
    </div>
  );
}

export default Page;
