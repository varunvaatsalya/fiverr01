"use client";
import Link from "next/link";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { BsBuildingFillAdd, BsFillPersonBadgeFill } from "react-icons/bs";
import { FaFilePrescription } from "react-icons/fa";
import {
  FaMoneyBillTrendUp,
  FaPersonCirclePlus,
  FaUserDoctor,
} from "react-icons/fa6";
import { IoMdAnalytics } from "react-icons/io";
import { IoLogOut } from "react-icons/io5";
import { GiMedicines } from "react-icons/gi";

function Page() {
  const router = useRouter();
  const Works = [
    {
      name: "Prescription",
      description: "You can see all the prescription",
      icon: <FaFilePrescription size={50} />,
      link: "/dashboard-owner/prescriptions",
      color: "bg-blue-700",
    },
    {
      name: "Analytics",
      description: "You can show the analytics",
      icon: <IoMdAnalytics size={50} />,
      link: "/dashboard-owner/analytics",
      color: "bg-purple-700",
    },
    {
      name: "Expenses",
      description: "You can show & add the all the Expenses.",
      icon: <FaMoneyBillTrendUp size={50} />,
      link: "/dashboard-owner/expenses",
      color: "bg-fuchsia-700",
    },
    {
      name: "Pharmacy",
      description: "You can see all Parmacy logs here",
      icon: <GiMedicines size={50} />,
      link: "/dashboard-owner/pharmacy",
      color: "bg-red-900",
    },
    {
      name: "Sales Men",
      description:
        "Show, add the new salesman & give the access to edit the invoice",
      icon: <BsFillPersonBadgeFill size={40} />,
      link: "/dashboard-owner/salesman",
      color: "bg-amber-700",
    },
    {
      name: "Patients",
      description: "You can show & add the patients",
      icon: <FaPersonCirclePlus size={50} />,
      link: "/dashboard-owner/patients",
      color: "bg-pink-700",
    },
    {
      name: "Departments",
      description:
        "You can show & add the departsments of diffrent hospitals & thier respective itmes",
      icon: <BsBuildingFillAdd size={50} />,
      link: "/dashboard-owner/departments",
      color: "bg-orange-700",
    },
    {
      name: "Doctors",
      description: "You can show & add the doctors of diffrent hospitals",
      icon: <FaUserDoctor size={50} />,
      link: "/dashboard-owner/doctors",
      color: "bg-green-700",
    },
    {
      name: "Audit Trails",
      description: "You can see audit trails here",
      icon: <AiOutlineAudit size={40} />,
      link: "/dashboard-admin/auditTrails",
      color: "bg-fuchsia-700",
    },
  ];
  return (
    <>
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex flex-wrap justify-center items-center gap-8 p-6">
          {Works.map((workCard, index) => {
            return (
              <>
                <Link
                  href={workCard.link}
                  key={index}
                  className={`w-full p-3 h-60 md:w-2/5 lg:w-1/5 ${workCard.color} text-white rounded-xl flex flex-col justify-center items-center space-y-1 hover:scale-105`}
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
    </>
  );
}

export default Page;
