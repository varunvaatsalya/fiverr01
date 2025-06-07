import Navbar from "@/app/components/Navbar";
import React from "react";

function page() {
  return (
    <div className="w-full min-h-screen h-screen flex flex-col items-center">
      <div className="w-full">
        <Navbar route={["Retails", "Sell Report"]} />
      </div>
    </div>
  );
}

export default page;
