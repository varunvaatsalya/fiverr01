"use client";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { FaBoxesStacked, FaCalculator } from "react-icons/fa6";
import { IoIosGitBranch } from "react-icons/io";
import { IoFastFoodOutline } from "react-icons/io5";

function Page() {
  const Works = [
    {
      name: "Daily Consumables",
      description:
        "You can see all & create all the daily consumable expenses here",
      icon: <IoFastFoodOutline size={50} />,
      link: "/dashboard-admin/expenses/consumables",
      color: "bg-teal-700",
    },
    {
      name: "Assets",
      description: "You can show & manage the hospital assets here",
      icon: <FaBoxesStacked size={50} />,
      link: "/dashboard-admin/expenses/hospitalAssets",
      color: "bg-pink-700",
    },
    {
      name: "Expenses Analytics",
      description: "You can show all type of Expenses analytics.",
      icon: <FaCalculator size={50} />,
      link: "/dashboard-admin/expenses/analytics",
      color: "bg-fuchsia-700",
    },
    {
      name: "Categories",
      description: "You can see, create & edit all categories here",
      icon: <IoIosGitBranch size={50} />,
      link: "/dashboard-admin/expenses/categories",
      color: "bg-blue-900",
    },
  ];
  return (
    <>
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar route={["Expense"]} />
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
        </div>
      </div>
    </>
  );
}

export default Page;
