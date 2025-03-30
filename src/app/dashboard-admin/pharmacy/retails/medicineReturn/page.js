import React from "react";
import Navbar from "../../../../components/Navbar";

function Page() {
  return (
    <div className="flex flex-col w-full">
      <Navbar route={["Pharmacy", "Retails", "Medicine Return"]} />
    </div>
  );
}

export default Page;
