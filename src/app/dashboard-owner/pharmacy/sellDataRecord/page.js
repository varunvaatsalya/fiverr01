"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import MedicineSellRecord from "../../../components/MedicineSellRecord";
import { showError, showSuccess } from "../../../utils/toast";

function Page() {
  const [medicineData, setMedicineData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/newMedicine?sellRecord=1");
      const data = await response.json();
      setMedicineData(data.records);
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

  const updateData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/newMedicine/avgMonthlySale");

      const data = await response.json();
      if (data.success) {
        showSuccess(data.message);
        fetchData();
      } else {
        showError(data.message);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen h-screen flex flex-col items-center">
      <div className="w-full">
        <Navbar route={["Sell Records"]} />
      </div>
      <MedicineSellRecord
        medicineData={medicineData}
        loading={loading}
        updateData={updateData}
      />
    </div>
  );
}

export default Page;
