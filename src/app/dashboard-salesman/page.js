"use client";
import Link from "next/link";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { FaFilePrescription, FaShippingFast } from "react-icons/fa";
import { FaMoneyBillTrendUp, FaPersonCirclePlus } from "react-icons/fa6";
import { TbReportMedical } from "react-icons/tb";
import { IoLogOut } from "react-icons/io5";

function Page() {
  const router = useRouter();
  const Works = [
    {
      name: "Patients",
      description: "You can show & add the patients",
      icon: <FaPersonCirclePlus size={50} />,
      link: "/dashboard-salesman/patients",
      color: "bg-blue-700",
    },
    {
      name: "Prescription",
      description: "You can see all the prescription",
      icon: <FaFilePrescription size={50} />,
      link: "/dashboard-salesman/prescriptions",
      color: "bg-pink-700",
    },
    {
      name: "Express Billing",
      description: "You can show & create invoice of data entry",
      icon: <FaShippingFast size={50} />,
      link: "/dashboard-salesman/expressBilling",
      color: "bg-amber-500",
    },
    {
      name: "Reports",
      description:
        "You can see all pathology reports and print",
      icon: <TbReportMedical size={50} />,
      link: "/dashboard-salesman/reports",
      color: "bg-orange-500",
    },
    {
      name: "Expenses",
      description:
        "You can show & add the all the Expenses.",
      icon: <FaMoneyBillTrendUp size={50} />,
      link: "/dashboard-salesman/expenses",
      color: "bg-fuchsia-700",
    },
  ];
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex flex-wrap justify-center items-center gap-8 p-6">
          {Works.map((workCard, index) => {
            return (
              <>
                <Link
                  href={workCard.link}
                  key={index}
                  className={`w-full p-3 h-60 md:w-2/5 lg:w-1/5 ${workCard.color} text-white rounded-xl flex flex-col justify-center items-center space-y-1`}
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
