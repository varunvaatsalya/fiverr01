import React from "react";
import { MdOutlineLibraryAdd } from "react-icons/md";
import { TbClockExclamation, TbExchange, TbReportMoney } from "react-icons/tb";
import { VscGitPullRequestGoToChanges } from "react-icons/vsc";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import {
  FaEdit,
  FaFileInvoiceDollar,
  FaHistory,
  FaWhatsapp,
} from "react-icons/fa";

function Page() {
  const Works = [
    {
      name: "Purchase Invoice",
      description: "You can create & view purchase stocks invoice",
      icon: <FaFileInvoiceDollar size={50} />,
      link: "/dashboard-admin/pharmacy/godown/purchaseInvoices",
      color: "bg-gray-800",
    },
    {
      name: "New Stocks",
      description: "You can add new stock of any invoice",
      icon: <MdOutlineLibraryAdd size={50} />,
      link: "/dashboard-admin/pharmacy/godown/newStock",
      color: "bg-blue-800",
    },
    {
      name: "Stock Info",
      description: "You can view & manage godown stock here",
      icon: <TbExchange size={50} />,
      link: "/dashboard-admin/pharmacy/godown/godownStock",
      color: "bg-teal-700",
    },
    {
      name: "Request From Retail",
      description: "You can view & transfer retail stock request here",
      icon: <VscGitPullRequestGoToChanges size={50} />,
      link: "/dashboard-admin/pharmacy/godown/godownStockRequest",
      color: "bg-yellow-700",
    },
    {
      name: "Stock Edit",
      description: "You can View & Edit godown stock here",
      icon: <FaEdit size={50} />,
      link: "/dashboard-admin/pharmacy/godown/editGodownStock",
      color: "bg-rose-700",
    },
    {
      name: "Payments History",
      description: "You can create and view all the due invoices here",
      icon: <TbReportMoney size={50} />,
      link: "/dashboard-admin/pharmacy/godown/purchaseDueInvoices",
      color: "bg-violet-700",
    },
    {
      name: "Stock Expiring Soon",
      description:
        "From here you can see the list of medicines that are going to expire soon.",
      icon: <TbClockExclamation size={50} />,
      link: "/dashboard-admin/pharmacy/godown/stockExpiring",
      color: "bg-amber-700",
    },
    {
      name: "Stock Order",
      description: "You can order the godown stock here",
      icon: <FaWhatsapp size={50} />,
      link: "/dashboard-admin/pharmacy/godown/stockOrder",
      color: "bg-green-700",
    },
    {
      name: "Whatsapp Order History",
      description: "You can see history of the godown orders here",
      icon: <FaHistory size={50} />,
      link: "/dashboard-admin/pharmacy/godown/stockOrderHistory",
      color: "bg-rose-700",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar route={["Pharmacy", "GoDown"]} />
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
