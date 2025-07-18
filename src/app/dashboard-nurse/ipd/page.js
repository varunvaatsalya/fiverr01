import React from "react";
import { FaOutdent } from "react-icons/fa6";
import { FaNetworkWired } from "react-icons/fa";
import { BsClipboardDataFill } from "react-icons/bs";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

function Page() {
  const Works = [
    {
      name: "IPD Registration",
      description: "You can show & manage the ipd patients here",
      icon: <FaNetworkWired size={50} />,
      link: "/dashboard-nurse/ipd/ipdWorks",
      color: "bg-teal-900",
    },
    {
      name: "Records",
      description: "You can see all the IPD Patient Records",
      icon: <BsClipboardDataFill size={50} />,
      link: "/dashboard-nurse/ipd/records",
      color: "bg-gray-700",
    },
    {
      name: "Outstanding Payment",
      description: "You can view all the payments pending patients here",
      icon: <FaOutdent size={50} />,
      link: "/dashboard-nurse/ipd/outstanding",
      color: "bg-green-900",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar route={["IPD"]} />
      <div className="flex-grow flex flex-wrap justify-center items-center gap-8 p-6">
        {Works.map((workCard) => {
          return (
            <>
              <Link
                href={workCard.link}
                key={workCard.name}
                className={`${workCard.color} w-full p-3 h-60 md:w-2/5 lg:w-1/5 text-white rounded-xl flex flex-col justify-center items-center space-y-1 hover:scale-105`}
              >
                {workCard.icon}
                <div className="font-bold text-xl">{workCard.name}</div>
                <div className="text-center">{workCard.description}</div>
              </Link>
            </>
          );
        })}
      </div>
      <Footer />
    </div>
  );
}

export default Page;
