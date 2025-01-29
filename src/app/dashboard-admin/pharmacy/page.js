import React from 'react'
import { FaFileArrowUp, FaOutdent } from "react-icons/fa6";
import { MdFormatListBulletedAdd } from "react-icons/md";
import { BsClipboardDataFill, BsReceipt } from "react-icons/bs";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { IoCreate } from 'react-icons/io5';

function Page() {
  const Works = [
    {
      name: "Create Invoices",
      description: "You can Create pharmacy Invoices here",
      icon: <IoCreate size={50} />,
      link: "/dashboard-admin/pharmacy/newInvoices",
      color: "bg-amber-800",
    },
    {
      name: "Invoices",
      description: "You can show all the pharmacy Invoices here",
      icon: <BsReceipt size={50} />,
      link: "/dashboard-admin/pharmacy/invoices",
      color: "bg-rose-900",
    },
    {
      name: "Retail Works",
      description: "You can see all the IPD Patient Records",
      icon: <BsClipboardDataFill size={50} />,
      link: "/dashboard-admin/pharmacy/retails",
      color: "bg-gray-700",
    },
    {
      name: "GoDown",
      description: "You can view all the Medicine Stock here",
      icon: <FaOutdent size={50} />,
      link: "/dashboard-admin/pharmacy/godown",
      color: "bg-blue-900",
    },
    {
      name: "Pharmacy Config",
      description: "You can edit & create pharmacy items",
      icon: <MdFormatListBulletedAdd size={50} />,
      link: "/dashboard-admin/pharmacy/pharmacyConfig",
      color: "bg-green-700",
    },
    {
      name: "Medicine Uploads",
      description: "You can edit & create pharmacy items",
      icon: <FaFileArrowUp size={50} />,
      link: "/dashboard-admin/pharmacy/uploads",
      color: "bg-fuchsia-700",
    },
  ];
  
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar route={["Pharmacy"]} />
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
  )
}

export default Page
