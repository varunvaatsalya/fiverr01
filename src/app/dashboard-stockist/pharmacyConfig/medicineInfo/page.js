import React from "react";
import Navbar from "@/app/components/Navbar";
import MedicineInfo from "@/app/components/MedicineInfo";

function Page() {
  return (
    <div className="flex flex-col h-screen min-h-screen">
      <Navbar route={["Pharmcy", "Config", "Info"]} />
      <MedicineInfo />
    </div>
  );
}

export default Page;
