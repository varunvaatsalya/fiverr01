"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import MedicineSellRecord from "@/app/components/MedicineSellRecord";
import { showError, showSuccess } from "@/app/utils/toast";

function Page() {
  const [medicineData, setMedicineData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monthYear, setMonthYear] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState("A");

  const fetchData = async () => {
    setLoading(true);
    try {
      // const response = await fetch("/api/newMedicine?sellRecord=1");
      const response = await fetch(`/api/newMedicine/monthlySellRecord?letter=${selectedLetter}&months=6`);
      const data = await response.json();
      setMedicineData(data.trends);
      setLastUpdated(data.lastUpdated);
      setMonthYear(data.monthYear);
    } catch (error) {
      console.error("Error fetching data:", error);
      showError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [selectedLetter]);

  const updateData = async () => {
    setLoading(true);
    try {
      // const response = await fetch("/api/newMedicine/avgMonthlySale");
      const response = await fetch("/api/newMedicine/monthlySellRecord", {
        method: "PUT",
      });
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
  };

  const resetData = async () => {
    if (!window.confirm("Are you sure you want to reset the data?")) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/newMedicine/monthlySellRecord", {
        method: "DELETE",
      });
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
  };

  return (
    <div className="w-full min-h-screen h-screen flex flex-col items-center">
      <div className="w-full">
        <Navbar route={["Sell Records"]} />
      </div>
      <MedicineSellRecord
        medicineData={medicineData}
        lastUpdated={lastUpdated}
        monthYear={monthYear}
        loading={loading}
        updateData={updateData}
        resetData={resetData}
        selectedLetter={selectedLetter}
        setSelectedLetter={setSelectedLetter}
      />
    </div>
  );
}

export default Page;
