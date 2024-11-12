import React from 'react'
import { GrAnalytics } from "react-icons/gr";
import { FaNetworkWired } from "react-icons/fa";
import { MdFormatListBulletedAdd } from "react-icons/md";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';

function Page() {
  const Works = [
    {
      name: "Beds",
      description: "You can create & edit wards and their beds",
      icon: <GrAnalytics size={50} />,
      link: "/dashboard-admin/ipd/ipdConfig/beds",
      color: "bg-gray-700",
    },
    {
      name: "Items",
      description: "You can show & manage the ipd items here",
      icon: <FaNetworkWired size={50} />,
      link: "/dashboard-admin/ipd/ipdConfig/items",
      color: "bg-green-700",
    },
    {
      name: "Package",
      description: "You can edit & create ipd Packages",
      icon: <MdFormatListBulletedAdd size={50} />,
      link: "/dashboard-admin/ipd/packages",
      color: "bg-yellow-700",
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
  )
}

export default Page
