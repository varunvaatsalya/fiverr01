"use client";
import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import MedicineMarginReport from "../../../../components/MedicineMarginReport";
import { showError } from "../../../../utils/toast";

function Page() {
  const [payload, setPayload] = useState({
    manufacturer: "",
    salt: "",
  });
  const [marginData, setMarginData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/stockRequest/stockMargin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setMarginData(data.reports);
    } catch (error) {
      console.error("Error fetching data:", error);
      showError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen h-screen flex flex-col items-center">
      <div className="w-full">
        <Navbar route={["Godown", "Margin Report"]} />
      </div>
      <MedicineMarginReport
        payload={payload}
        setPayload={setPayload}
        marginData={marginData}
        loading={loading}
        fetchData={fetchData}
      />
    </div>
  );
}

export default Page;
