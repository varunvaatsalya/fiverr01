import React from "react";
import Navbar from "../../components/Navbar";

function Page() {
  return (
    <div className="h-screen w-full bg-gray-100">
      <Navbar route={["Display"]} />
    </div>
  );
}

export default Page;
