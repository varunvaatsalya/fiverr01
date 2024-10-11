import Link from "next/link";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { BsFillPersonBadgeFill } from "react-icons/bs";

function page() {
  const Works = [
    {
      name: "Sales Men",
      description: "You can Show all the salesman of diffrent hospitals, also add the new salesman & give the access to edit the invoice",
      icon: <BsFillPersonBadgeFill size={30} />,
      link: "/dashboard-admin/salesman",
      color: "yellow",
    },
    {
      name: "Owners",
      description: "You can Show all the owners of diffrent hospitals, also create the new owner",
      icon: <BsFillPersonBadgeFill size={30} />,
      link: "/dashboard-admin/owners",
      color: "yellow",
    },
    {
      name: "Departments",
      description: "You can show & add the departsments of diffrent hospitals & thier respective itmes",
      icon: <BsFillPersonBadgeFill size={30} />,
      link: "/dashboard-admin/departments",
      color: "yellow",
    },
    {
      name: "Doctors",
      description: "You can show & add the doctors of diffrent hospitals",
      icon: <BsFillPersonBadgeFill size={30} />,
      link: "/",
      color: "yellow",
    },
    {
      name: "Prescription",
      description: "You can see all the prescription",
      icon: <BsFillPersonBadgeFill size={30} />,
      link: "/",
      color: "yellow",
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
                  className="w-full p-3 h-60 md:w-2/5 lg:w-1/5 bg-black text-white rounded-xl flex flex-col justify-center items-center space-y-1"
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
    </>
  );
}

export default page;
