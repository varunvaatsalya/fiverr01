"use client";
import React from "react";
import { MdFormatListBulletedAdd, MdOutlineLibraryAdd } from "react-icons/md";
import { TbClockExclamation, TbExchange, TbReportMoney } from "react-icons/tb";
import { VscGitPullRequestGoToChanges } from "react-icons/vsc";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { FaEdit, FaFileInvoiceDollar, FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { IoLogOut } from "react-icons/io5";

function Page() {
  const router = useRouter();
  const Works = [
    {
      name: "Purchase Invoice",
      description: "You can create & view purchase stocks invoice",
      icon: <FaFileInvoiceDollar size={50} />,
      link: "/dashboard-stockist/purchaseInvoices",
      color: "bg-gray-800",
    },
    {
      name: "New Stocks",
      description: "You can add new stock of any invoice",
      icon: <MdOutlineLibraryAdd size={50} />,
      link: "/dashboard-stockist/newStock",
      color: "bg-blue-800",
    },
    {
      name: "Stock Info",
      description: "You can view & manage godown stock here",
      icon: <TbExchange size={50} />,
      link: "/dashboard-stockist/godownStock",
      color: "bg-teal-700",
    },
    {
      name: "Request From Retail",
      description: "You can view & transfer retail stock request here",
      icon: <VscGitPullRequestGoToChanges size={50} />,
      link: "/dashboard-stockist/godownStockRequest",
      color: "bg-yellow-700",
    },
    {
      name: "Stock Edit",
      description: "You can View & Edit godown stock here",
      icon: <FaEdit size={50} />,
      link: "/dashboard-stockist/editGodownStock",
      color: "bg-rose-700",
    },
    {
      name: "Payments Due",
      description: "You can create and view all the due invoices here",
      icon: <TbReportMoney size={50} />,
      link: "/dashboard-stockist/purchaseDueInvoices",
      color: "bg-violet-700",
    },
    {
      name: "Stock Expiring Soon",
      description:
        "From here you can see the list of medicines that are going to expire soon.",
      icon: <TbClockExclamation size={50} />,
      link: "/dashboard-stockist/stockExpiring",
      color: "bg-amber-700",
    },
    {
      name: "Stock Order",
      description: "You can order the godown stock here",
      icon: <FaWhatsapp size={50} />,
      link: "/dashboard-stockist/stockOrder",
      color: "bg-green-700",
    },
    {
      name: "Pharmacy Config",
      description: "You can edit & create pharmacy items",
      icon: <MdFormatListBulletedAdd size={50} />,
      link: "/dashboard-stockist/pharmacyConfig",
      color: "bg-green-800",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar route={["Pharmacy", "GoDown"]} />
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
