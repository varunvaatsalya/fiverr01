import React from "react";
import { FaCircleInfo } from "react-icons/fa6";
import { MdMedicalInformation } from "react-icons/md";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

function Page() {
  const Works = [
    {
      name: "Add/Edit Medicine",
      description: "You can edit & create pharmacy Medicine here",
      icon: <MdMedicalInformation size={50} />,
      link: "/dashboard-stockist/pharmacyConfig/addMedicine",
      color: "bg-teal-700",
    },
    {
      name: "Medicine Info",
      description: "You can show & manage the medicine's meta data",
      icon: <FaCircleInfo size={40} />,
      link: "/dashboard-stockist/pharmacyConfig/metaData",
      color: "bg-violet-700",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar route={["Pharmacy", "Config"]} />
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
