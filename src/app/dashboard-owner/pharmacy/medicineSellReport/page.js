"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import MedicineSellReport from "../../../components/MedicineSellReport";
import { showError } from "../../../utils/toast";

function Page() {
  const [payload, setPayload] = useState({
    startDate: "",
    endDate: "",
    manufacturerId: "",
    saltId: "",
  });
  const [medicineData, setMedicineData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/newPharmacyInvoice/sellReport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setMedicineData(data.reports);
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
        <Navbar route={["Retails", "Sell Report"]} />
      </div>
      <MedicineSellReport
        setPayload={setPayload}
        medicineData={medicineData}
        loading={loading}
        fetchData={fetchData}
      />
    </div>
  );
}

export default Page;
