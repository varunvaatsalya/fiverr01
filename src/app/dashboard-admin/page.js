"use client";
import Link from "next/link";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { BsBuildingFillAdd } from "react-icons/bs";
import {
  FaFilePrescription,
  FaFileUpload,
  FaShippingFast,
} from "react-icons/fa";
import {
  FaKitMedical,
  FaMoneyBillTrendUp,
  FaPersonCirclePlus,
  FaUserDoctor,
  FaUsersGear,
} from "react-icons/fa6";
import { GiMedicinePills, GiMedicines } from "react-icons/gi";
import { IoMdAnalytics } from "react-icons/io";
import { TbReportMedical } from "react-icons/tb";
import { GrTest } from "react-icons/gr";
import { IoLogOut } from "react-icons/io5";
import { MdOutlineQueuePlayNext, MdOutlineSecurity } from "react-icons/md";
import { AiOutlineAudit } from "react-icons/ai";
import { useAuth } from "../context/AuthContext";

function Page() {
  const router = useRouter();
  const { setUser } = useAuth();

  const Works = [
    // {
    //   name: "test",
    //   description: "You can see all the prescription",
    //   icon: <FaFilePrescription size={50} />,
    //   link: "/dashboard-admin/test",
    //   color: "bg-pink-700",
    // },
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
      name: "Hospital Pharmacy",
      description: "You can see all Hospital Parmacy logs here",
      icon: <GiMedicinePills size={50} />,
      link: "/dashboard-admin/hospitalPharmacy",
      color: "bg-teal-900",
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
    {
      name: "Audit Trails",
      description: "You can see audit trails here",
      icon: <AiOutlineAudit size={40} />,
      link: "/dashboard-admin/auditTrails",
      color: "bg-fuchsia-700",
    },
    {
      name: "Data Exports",
      description: "You can exports your data here",
      icon: <FaFileUpload size={40} />,
      link: "/dashboard-admin/exports",
      color: "bg-amber-700",
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
              setUser(null);
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
