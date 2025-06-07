import React from "react";
import { FaFileArrowUp, FaOutdent } from "react-icons/fa6";
import { MdAccountBalanceWallet } from "react-icons/md";
import { BsClipboardDataFill, BsReceipt } from "react-icons/bs";
import { BiTransferAlt } from "react-icons/bi";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

function Page() {
  const Works = [
    {
      name: "Analytics",
      description: "You can view pharmacy accounts here",
      icon: <MdAccountBalanceWallet size={50} />,
      link: "/dashboard-admin/hospitalPharmacy/pharmacyAnalytics",
      color: "bg-emerald-700",
    },
    {
      name: "Invoices",
      description: "You can show all the hospital medicine expenses here",
      icon: <BsReceipt size={50} />,
      link: "/dashboard-admin/hospitalPharmacy/invoices",
      color: "bg-red-900",
    },
    {
      name: "Retail Works",
      description: "You can see all the IPD Patient Records",
      icon: <BsClipboardDataFill size={50} />,
      link: "/dashboard-admin/hospitalPharmacy/retails",
      color: "bg-sky-800",
    },
    {
      name: "GoDown",
      description: "You can view all the Medicine Stock here",
      icon: <FaOutdent size={50} />,
      link: "/dashboard-admin/hospitalPharmacy/godown",
      color: "bg-emerald-900",
    },
    {
      name: "Requests",
      description: "You can view all the retails godown Stock Requests here",
      icon: <BiTransferAlt size={50} />,
      link: "/dashboard-admin/hospitalPharmacy/retailGodownRequests",
      color: "bg-pink-700",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar route={["Hospital Pharmacy"]} />
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
      </div>
      <Footer />
    </div>
  );
}

export default Page;
