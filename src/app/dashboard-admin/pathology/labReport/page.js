import React from "react";
import Navbar from "@/app/components/Navbar";
import UploadPathLabReport from "@/app/components/UploadPathLabReport";
function Page() {
  return (
    <div className="bg-gray-400 min-h-screen w-full">
      <Navbar route={["Pathology", "Lab Report"]} />
      <UploadPathLabReport />
    </div>
  );
}

export default Page;
