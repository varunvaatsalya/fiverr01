import React from "react";
import { MdOutlineLibraryAdd } from "react-icons/md";
import { TbExchange, TbBrandDatabricks } from "react-icons/tb";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";

function Page() {
  const Works = [
    {
      name: "New Stocks",
      description: "You can create & edit wards and their beds",
      icon: <MdOutlineLibraryAdd size={50} />,
      link: "/dashboard-admin/pharmacy/godown/newStock",
      color: "bg-blue-800",
    },
    {
      name: "Stock Transfer",
      description: "You can view & transfer godown stock here",
      icon: <TbExchange size={50} />,
      link: "/dashboard-admin/pharmacy/godown/transfer",
      color: "bg-teal-700",
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
                className={`${workCard.color} w-full p-3 h-60 md:w-2/5 lg:w-1/5 text-white rounded-xl flex flex-col justify-center items-center space-y-1`}
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
