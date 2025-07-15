"use client";
import React from "react";
import { FaHandHoldingMedical } from "react-icons/fa";
import { TbClockExclamation } from "react-icons/tb";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { IoBagAddSharp, IoCreate, IoLogOut } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { BsReceipt } from "react-icons/bs";
import { MdSpeakerNotes } from "react-icons/md";
import { FaPersonCirclePlus } from "react-icons/fa6";

function Page() {
  const router = useRouter();
  const Works = [
    {
      name: "Distribution",
      description: "You can create & edit wards and their beds",
      icon: <FaHandHoldingMedical size={50} />,
      link: "/dashboard-dispenser/works",
      color: "bg-blue-800",
    },
    {
      name: "Create Invoices",
      description: "You can Create pharmacy Invoices here",
      icon: <IoCreate size={50} />,
      link: "/dashboard-dispenser/newInvoices",
      color: "bg-gray-800",
    },
    {
      name: "Invoices",
      description: "You can show all the pharmacy Invoices here",
      icon: <BsReceipt size={50} />,
      link: "/dashboard-dispenser/invoices",
      color: "bg-rose-900",
    },
    {
      name: "Express Billing",
      description: "You can show all the pharmacy Express Invoices here",
      icon: <MdSpeakerNotes size={50} />,
      link: "/dashboard-dispenser/pharmacyExpressBilling",
      color: "bg-sky-600",
    },
    {
      name: "Patients",
      description: "You can show & add the patients",
      icon: <FaPersonCirclePlus size={50} />,
      link: "/dashboard-dispenser/patients",
      color: "bg-pink-700",
    },
    {
      name: "Stock Request",
      description: "You can order the medicine form godown.",
      icon: <IoBagAddSharp size={50} />,
      link: "/dashboard-dispenser/stockRequest",
      color: "bg-rose-700",
    },
    {
      name: "Stock Expiring Soon",
      description:
        "From here you can see the list of medicines that are going to expire soon.",
      icon: <TbClockExclamation size={50} />,
      link: "/dashboard-dispenser/stockExpiring",
      color: "bg-amber-700",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar route={["Pharmacy", "Retails"]} />
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
        <button
          onClick={() => {
            document.cookie =
              "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            router.push("/login");
          }}
          className="w-full p-3 h-60 md:w-2/5 lg:w-1/5 bg-red-700 text-white rounded-xl flex flex-col justify-center items-center space-y-1"
        >
          <IoLogOut size={60} />
          <div className="font-bold text-xl">Logout</div>
        </button>
      </div>
      <Footer />
    </div>
  );
}

export default Page;
