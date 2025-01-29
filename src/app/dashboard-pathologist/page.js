"use client";
import Link from "next/link";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { IoLogOut } from "react-icons/io5";
import { TbReportMedical } from "react-icons/tb";
import { GrDocumentTest } from "react-icons/gr";
import { MdRebaseEdit } from "react-icons/md";

function Page() {
  const router = useRouter();
  const Works = [
    {
      name: "Lab Test report",
      description:
        "You can see all the reports",
      icon: <GrDocumentTest size={50} />,
      link: "/dashboard-pathologist/labReport",
      color: "bg-blue-700",
    },
    {
      name: "Reports",
      description:
        "You can see all pathology reports and print",
      icon: <TbReportMedical size={50} />,
      link: "/dashboard-pathologist/reports",
      color: "bg-orange-500",
    },
    {
      name: "Edit Test report",
      description:
        "You can see & edit all the reports",
      icon: <MdRebaseEdit size={50} />,
      link: "/dashboard-pathologist/editLabReport",
      color: "bg-gray-700",
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
