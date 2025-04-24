import React from "react";
import Navbar from "../../../../components/Navbar";
import MedicineSellReport from "../../../../components/MedicineSellReport";

function Page() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-1">
      <Navbar />
      <MedicineSellReport />
    </div>
  );
}

export default Page;
