import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";
import Link from "next/link";
import React from "react";
import { FaPersonArrowUpFromLine } from "react-icons/fa6";

function Page() {
  const Works = [
    {
      name: "Patients",
      description: "You can filter & exports the patient data here",
      icon: <FaPersonArrowUpFromLine size={50} />,
      link: "/dashboard-admin/exports/patients",
      // color: "bg-violet-700",
      color: "bg-gray-700",
    },
    {
      name: "Prescriptions",
      description: "You can filter & exports the prescriptions data here",
      icon: <FaPersonArrowUpFromLine size={50} />,
      link: "/dashboard-admin/exports/prescriptions",
      // color: "bg-rose-700",
      color: "bg-gray-700",
    },
    {
      name: "Medicine Details",
      description: "You can filter & exports the prescriptions data here",
      icon: <FaPersonArrowUpFromLine size={50} />,
      link: "/dashboard-admin/exports/medicineData",
      color: "bg-fuchsia-700",
    },
    {
      name: "Manufacturers",
      description: "You can filter & exports the prescriptions data here",
      icon: <FaPersonArrowUpFromLine size={50} />,
      link: "/dashboard-admin/exports/prescriptions",
      // color: "bg-blue-700",
      color: "bg-gray-700",
    },
    {
      name: "Vendors",
      description: "You can filter & exports the prescriptions data here",
      icon: <FaPersonArrowUpFromLine size={50} />,
      link: "/dashboard-admin/exports/prescriptions",
      // color: "bg-green-700",
      color: "bg-gray-700",
    },
    {
      name: "Salts",
      description: "You can filter & exports the prescriptions data here",
      icon: <FaPersonArrowUpFromLine size={50} />,
      link: "/dashboard-admin/exports/prescriptions",
      // color: "bg-amber-700",
      color: "bg-gray-700",
    },
    {
      name: "Retail Stocks",
      description: "You can filter & exports the prescriptions data here",
      icon: <FaPersonArrowUpFromLine size={50} />,
      link: "/dashboard-admin/exports/prescriptions",
      // color: "bg-teal-700",
      color: "bg-gray-700",
    },
    {
      name: "Godown Stocks",
      description: "You can filter & exports the prescriptions data here",
      icon: <FaPersonArrowUpFromLine size={50} />,
      link: "/dashboard-admin/exports/godownStocks",
      color: "bg-sky-700",
    },
    {
      name: "Godown Invoices",
      description: "You can filter & exports the prescriptions data here",
      icon: <FaPersonArrowUpFromLine size={50} />,
      link: "/dashboard-admin/exports/prescriptions",
      // color: "bg-gray-700",
      color: "bg-gray-700",
    },
    {
      name: "Sell Reports",
      description: "You can filter & exports the prescriptions data here",
      icon: <FaPersonArrowUpFromLine size={50} />,
      link: "/dashboard-admin/exports/prescriptions",
      // color: "bg-lime-700",
      color: "bg-gray-700",
    },
  ];
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar route={["Exports"]} />
      <div className="flex-grow flex flex-wrap justify-center items-center gap-8 p-6">
        {Works.map((workCard) => {
          return (
            <Link
              href={workCard.link}
              key={workCard.name}
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
