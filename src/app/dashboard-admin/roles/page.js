import React from "react";
import { FaFileArrowUp, FaHouseMedicalFlag, FaOutdent, FaUserDoctor } from "react-icons/fa6";
import { MdAdminPanelSettings, MdFormatListBulletedAdd, MdSpeakerNotes } from "react-icons/md";
import { BsClipboardDataFill, BsFillPersonBadgeFill, BsFillPersonVcardFill, BsReceipt } from "react-icons/bs";
import { BiTransferAlt } from "react-icons/bi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { IoCreate } from "react-icons/io5";
import { FaNotesMedical, FaUserNurse } from "react-icons/fa";

function Page() {
  const Works = [
    {
      name: "Sales Men",
      description:
        "Show, add the new salesman & give the access to edit the invoice",
      icon: <BsFillPersonBadgeFill size={40} />,
      link: "/dashboard-admin/roles/salesman",
      color: "bg-yellow-700",
    },
    {
      name: "Nurse",
      description: "You can show & add the Nurses",
      icon: <FaUserNurse size={50} />,
      link: "/dashboard-admin/roles/nurse",
      color: "bg-sky-800",
    },
    {
      name: "Pathologist",
      description: "You can show & add the doctors of diffrent hospitals",
      icon: <FaUserDoctor size={50} />,
      link: "/dashboard-admin/roles/pathologist",
      color: "bg-black",
    },
    {
      name: "Owners",
      description:
        "You can Show all the owners of diffrent hospitals, also create the new owner",
      icon: <BsFillPersonVcardFill size={50} />,
      link: "/dashboard-admin/roles/owners",
      color: "bg-cyan-700",
    },
    {
      name: "Admins",
      description: "You can Show all the admins also create & delete",
      icon: <MdAdminPanelSettings size={50} />,
      link: "/dashboard-admin/roles/admins",
      color: "bg-gray-700",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar route={["User Roles"]} />
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
            href={"/dashboard-admin/pharmacy/dispenser"}
            className="h-2/5 flex justify-center items-center gap-2 border-b-2 border-pink-500 hover:bg-pink-700 w-full rounded-xl"
          >
            <FaNotesMedical size={30} />
            <div className="text-xl font-bold text-white">Dispenser</div>
          </Link>
          <Link
            href={"/dashboard-admin/pharmacy/stockist"}
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
