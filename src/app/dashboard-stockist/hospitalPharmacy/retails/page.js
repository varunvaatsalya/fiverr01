import React from "react";
// import { FaHandHoldingMedical } from "react-icons/fa";
import { TbChartInfographic } from "react-icons/tb";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { IoBagAddSharp } from "react-icons/io5";

function Page() {
  const Works = [
    // {
    //   name: "Distribution",
    //   description: "You can create & edit wards and their beds",
    //   icon: <FaHandHoldingMedical size={50} />,
    //   link: "/dashboard-stockist/hospitalPharmacy/retails/works",
    //   color: "bg-blue-800",
    // },
    {
      name: "Stock Info",
      description: "You can view & manage retail stock here",
      icon: <TbChartInfographic size={50} />,
      link: "/dashboard-stockist/hospitalPharmacy/retails/retailStock",
      color: "bg-lime-700",
    },
    {
      name: "Stock Request",
      description: "You can order the medicine form godown.",
      icon: <IoBagAddSharp size={50} />,
      link: "/dashboard-stockist/hospitalPharmacy/retails/stockRequest",
      color: "bg-rose-700",
    },
    // {
    //   name: "Medicine Sell Report",
    //   description: "You can show all the medicine sell report.",
    //   icon: <IoStatsChart  size={50} />,
    //   link: "/dashboard-stockist/hospitalPharmacy/retails/medicineSellReport",
    //   color: "bg-teal-700",
    // },
    // {
    //   name: "Stock Expiring Soon",
    //   description:
    //     "From here you can see the list of medicines that are going to expire soon.",
    //   icon: <TbClockExclamation size={50} />,
    //   link: "/dashboard-stockist/hospitalPharmacy/retails/stockExpiring",
    //   color: "bg-amber-700",
    // },
    // {
    //   name: "Stock Edit",
    //   description:
    //     "From here you can see & edit retail inventory.",
    //   icon: <TbEditCircle size={50} />,
    //   link: "/dashboard-stockist/hospitalPharmacy/retails/stockEdit",
    //   color: "bg-fuchsia-700",
    // },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar route={["Pharmacy", "Retails"]} />
      <div className="flex-grow flex flex-wrap justify-center items-center gap-8 p-6">
        {Works.map((workCard) => {
          return (
            <Link
              href={workCard.link}
              key={workCard.name}
              className={`${workCard.color} w-full p-3 h-60 md:w-2/5 lg:w-1/5 text-white rounded-xl flex flex-col justify-center items-center space-y-1 hover:scale-105`}
            >
              {workCard.icon}
              <div className="text-lg font-semibold">Hospital</div>
              <div className="font-bold text-xl leading-4">{workCard.name}</div>
              <div className="text-center">{workCard.description}</div>
            </Link>
          );
        })}
      </div>
      <Footer />
    </div>
  );
}

export default Page;
