import React from "react";
import Navbar from "@/app/components/Navbar";
import AuditTrails from "@/app/components/AuditTrails";

function Page() {
  return (
    <div className="flex flex-col">
      <Navbar route={["Audit Traills"]} />
      <AuditTrails />
    </div>
  );
}

export default Page;
