import React from "react";
import { FaHouseMedicalFlag } from "react-icons/fa6";
import { BsReceipt } from "react-icons/bs";
import { BiTransferAlt } from "react-icons/bi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { FaNotesMedical, FaOutdent } from "react-icons/fa";
import { MdAccountBalanceWallet } from "react-icons/md";
import { IoStatsChart } from "react-icons/io5";

function Page() {
  const Works = [
    {
      name: "Analytics",
      description: "You can view pharmacy accounts here",
      icon: <MdAccountBalanceWallet size={50} />,
      link: "/dashboard-owner/pharmacy/pharmacyAnalytics",
      color: "bg-teal-800",
    },
    {
      name: "Invoices",
      description: "You can show all the pharmacy Invoices here",
      icon: <BsReceipt size={50} />,
      link: "/dashboard-owner/pharmacy/invoices",
      color: "bg-rose-900",
    },
    {
      name: "GoDown",
      description: "You can view all the Medicine Stock here",
      icon: <FaOutdent size={50} />,
      link: "/dashboard-owner/pharmacy/godown",
      color: "bg-blue-900",
    },
    {
      name: "Requests",
      description: "You can view all the retails godown Stock Requests here",
      icon: <BiTransferAlt size={50} />,
      link: "/dashboard-owner/pharmacy/retailGodownRequests",
      color: "bg-yellow-700",
    },
    {
      name: "Medicine Sell Report",
      description: "You can show all the medicine sell report.",
      icon: <IoStatsChart size={50} />,
      link: "/dashboard-owner/pharmacy/medicineSellReport",
      color: "bg-teal-700",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar route={["Pharmacy"]} />
      <div className="flex-grow flex flex-wrap justify-center items-center gap-8 p-6">
        {Works.map((workCard) => {
          return (
            <Link
              href={workCard.link}
              key={workCard.link}
              className={`${workCard.color} w-full p-3 h-60 md:w-2/5 lg:w-1/5 text-white rounded-xl flex flex-col justify-center items-center space-y-1 hover:scale-105`}
            >
              {workCard.icon}
              <div className="font-bold text-xl">{workCard.name}</div>
              <div className="text-center">{workCard.description}</div>
            </Link>
          );
        })}
        <div className="bg-pink-600 w-full p-3 h-60 md:w-2/5 lg:w-1/5 text-white rounded-xl flex flex-col justify-center items-center space-y-1 hover:scale-105">
          <div className="h-1/5 w-full border-b-2 border-pink-500 text-center py-1 text-lg font-semibold">
            Pharmacy Users
          </div>
          <Link
            href={"/dashboard-owner/pharmacy/dispenser"}
            className="h-2/5 flex justify-center items-center gap-2 border-b-2 border-pink-500 hover:bg-pink-700 w-full rounded-xl"
          >
            <FaNotesMedical size={30} />
            <div className="text-xl font-bold text-white">Dispenser</div>
          </Link>
          <Link
            href={"/dashboard-owner/pharmacy/stockist"}
            className="h-2/5 flex justify-center items-center gap-2 border-b-2 border-pink-500 hover:bg-pink-700 w-full rounded-xl"
          >
            <FaHouseMedicalFlag size={30} />
            <div className="text-xl font-bold text-white">Stockist</div>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Page;
