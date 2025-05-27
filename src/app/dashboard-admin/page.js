"use client";
import Link from "next/link";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { BsBuildingFillAdd } from "react-icons/bs";
import { FaFilePrescription, FaShippingFast } from "react-icons/fa";
import {
  FaKitMedical,
  FaMoneyBillTrendUp,
  FaPersonCirclePlus,
  FaUserDoctor,
  FaUsersGear,
} from "react-icons/fa6";
import { GiMedicines } from "react-icons/gi";
import { IoMdAnalytics } from "react-icons/io";
import { TbReportMedical } from "react-icons/tb";
import { GrTest } from "react-icons/gr";
import { IoLogOut } from "react-icons/io5";
import { useEffect, useState } from "react";
import { MdOutlineQueuePlayNext, MdOutlineSecurity } from "react-icons/md";

function Page() {
  const router = useRouter();
  const [roleDetails, setRoleDetails] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/admin?loginInfo=1");
        result = await result.json();
        if (result.success) {
          setRoleDetails(result.loginInfos);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  const Works = [
    {
      name: "test",
      description: "You can see all the prescription",
      icon: <FaFilePrescription size={50} />,
      link: "/dashboard-admin/test",
      color: "bg-pink-700",
    },
    {
      name: "Invoices",
      description: "You can see all the prescription",
      icon: <FaFilePrescription size={50} />,
      link: "/dashboard-admin/prescriptions",
      color: "bg-blue-700",
    },
    {
      name: "Patients",
      description: "You can show & add the patients",
      icon: <FaPersonCirclePlus size={50} />,
      link: "/dashboard-admin/patients",
      color: "bg-pink-700",
    },
    {
      name: "Express Billing",
      description: "You can show & create invoice of data entry",
      icon: <FaShippingFast size={50} />,
      link: "/dashboard-admin/expressBilling",
      color: "bg-amber-500",
    },
    {
      name: "Analytics",
      description: "You can show the analytics",
      icon: <IoMdAnalytics size={50} />,
      link: "/dashboard-admin/analytics",
      color: "bg-purple-700",
    },
    {
      name: "IPD",
      description: "You can manage here your all IPD works",
      icon: <FaKitMedical size={50} />,
      link: "/dashboard-admin/ipd",
      color: "bg-amber-800",
    },
    {
      name: "Pathology",
      description: "You can manage here your pathology data",
      icon: <GrTest size={50} />,
      link: "/dashboard-admin/pathology",
      color: "bg-teal-700",
    },
    {
      name: "Reports",
      description: "You can see all pathology reports and print",
      icon: <TbReportMedical size={50} />,
      link: "/dashboard-admin/reports",
      color: "bg-cyan-900",
    },
    {
      name: "Pharmacy",
      description: "You can see all Parmacy logs here",
      icon: <GiMedicines size={50} />,
      link: "/dashboard-admin/pharmacy",
      color: "bg-red-900",
    },
    {
      name: "Expenses",
      description: "You can show & add the all the Expenses.",
      icon: <FaMoneyBillTrendUp size={50} />,
      link: "/dashboard-admin/expenses",
      color: "bg-fuchsia-700",
    },
    {
      name: "Departments",
      description:
        "You can show & add the departsments of diffrent hospitals & thier respective itmes",
      icon: <BsBuildingFillAdd size={50} />,
      link: "/dashboard-admin/departments",
      color: "bg-orange-700",
    },
    {
      name: "Doctors",
      description:
        "You can show & add the doctors of diffrent diffrent departments",
      icon: <FaUserDoctor size={50} />,
      link: "/dashboard-admin/doctors",
      color: "bg-green-700",
    },
    {
      name: "User Role",
      description: "You can show & add the all role users here",
      icon: <FaUsersGear size={40} />,
      link: "/dashboard-admin/roles",
      color: "bg-rose-700",
    },
    {
      name: "Display",
      description: "You can manage hospital queue display here",
      icon: <MdOutlineQueuePlayNext size={40} />,
      link: "/dashboard-admin/display",
      color: "bg-teal-700",
    },
    {
      name: "Security",
      description: "You can manage website's security here",
      icon: <MdOutlineSecurity size={40} />,
      link: "/dashboard-admin/security",
      color: "bg-cyan-700",
    },
  ];
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
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
        {roleDetails.length > 0 && (
          <>
            <div className="text-xl font-semibold mb-2 text-center text-red-600">
              Latest Logins
            </div>
            <ul className="space-y-1 w-full md:w-3/4 lg:w-1/2 mx-auto">
              {roleDetails.map((user) => (
                <li
                  key={user._id}
                  className="py-2 px-4 bg-gray-800 rounded-lg shadow-md flex justify-around items-center"
                >
                  <div>
                    <p className="font-semibold text-white">{user.role.toUpperCase()}</p>
                    <p className="text-sm text-gray-400">
                      {user.lastUserEmail}
                    </p>
                  </div>
                  <p className="text-sm text-gray-300">
                    {new Date(user.lastLogin).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
        <Footer />
      </div>
    </>
  );
}

export default Page;
