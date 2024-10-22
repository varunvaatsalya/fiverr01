"use client";
import React, { useEffect, useState } from "react";
import Analytics from "../../components/Analytics";
import Loading from "../../components/Loading";

function Page() {
  const [data, setData] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/analytics");
        result = await result.json();
        if (result.success) {
          setData({
            departments: result.departments,
            doctors: result.doctors,
            prescriptions: result.prescriptions,
            expenses: result.expenses,
          });
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 w-full flex flex-col justify-center items-center">
        <Loading size={50} />
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Analytics
        prescriptions={data?.prescriptions}
        departments={data?.departments}
        doctors={data?.doctors}
        expenses={data?.expenses}
        setData={setData}
      />
    </>
  );
}

export default Page;
