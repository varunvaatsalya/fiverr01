import React from "react";
import Navbar from "../../../components/Navbar";

function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar route={["Security", "Login History"]} />
    </div>
  );
}

export default Page;
