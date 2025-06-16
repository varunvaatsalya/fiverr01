import React from "react";
import Navbar from "@/app/components/Navbar";
import LoginHistory from "@/app/components/LoginHistory";

function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar route={["Security", "Login History"]} />
      <LoginHistory />
    </div>
  );
}

export default Page;
