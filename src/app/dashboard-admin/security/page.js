import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { FaHistory } from "react-icons/fa";
import { BiLogOutCircle } from "react-icons/bi";

function Page() {
  const Works = [
    {
      name: "Logout Roles",
      description:
        "You can logout users of diffrent roles at once",
      icon: <BiLogOutCircle size={48} />,
      link: "/dashboard-admin/security/roleLogout",
      color: "bg-teal-700",
    },
    {
      name: "Login History",
      description: "You can show Users login history here",
      icon: <FaHistory size={50} />,
      link: "/dashboard-admin/security/loginHistory",
      color: "bg-indigo-800",
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
      </div>
      <Footer />
    </div>
  );
}

export default Page;
