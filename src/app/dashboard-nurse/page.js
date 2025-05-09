"use client";
import Link from "next/link";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { FaShippingFast } from "react-icons/fa";
import { TbReportMedical } from "react-icons/tb";
import { IoLogOut } from "react-icons/io5";
import { FaKitMedical, FaPersonCirclePlus } from "react-icons/fa6";
import { MdSpeakerNotes } from "react-icons/md";

function Page() {
  const router = useRouter();
  const Works = [
    {
      name: "Patients",
      description: "You can show & add the patients",
      icon: <FaPersonCirclePlus size={50} />,
      link: "/dashboard-nurse/patients",
      color: "bg-pink-700",
    },
    {
      name: "Express Billing",
      description: "You can show & create invoice of data entry",
      icon: <FaShippingFast size={50} />,
      link: "/dashboard-nurse/expressBilling",
      color: "bg-amber-500",
    },
    {
      name: "Pharmacy Billing",
      description: "You can show all the pharmacy Express Invoices here",
      icon: <MdSpeakerNotes size={50} />,
      link: "/dashboard-nurse/pharmacyExpressBilling",
      color: "bg-sky-600",
    },
    {
      name: "Reports",
      description: "You can see all pathology reports and print",
      icon: <TbReportMedical size={50} />,
      link: "/dashboard-nurse/reports",
      color: "bg-pink-500",
    },
    {
      name: "IPD",
      description: "You can manage here your all IPD works",
      icon: <FaKitMedical size={50} />,
      link: "/dashboard-nurse/ipd",
      color: "bg-amber-800",
    },
  ];
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
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
