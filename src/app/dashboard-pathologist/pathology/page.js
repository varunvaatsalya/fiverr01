import Link from "next/link";
import { GrDocumentTest } from "react-icons/gr";
import { GiThermometerScale } from "react-icons/gi";
import { MdOutlineAddChart } from "react-icons/md";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

function Page() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar route={["Pathology"]} />
        <div className="flex-grow flex flex-wrap justify-center items-center gap-8 p-6">
          <Link
            href="/dashboard-pathologist/pathology/labReport"
            className="bg-blue-700 w-full p-3 h-60 md:w-2/5 lg:w-1/5 text-white rounded-xl flex flex-col justify-center items-center space-y-1"
          >
            <GrDocumentTest size={50} />
            <div className="font-bold text-xl">Lab Test report</div>
            <div className="text-center">You can see all the prescription</div>
          </Link>

          <div
            className="bg-pink-600 w-full p-3 h-60 md:w-2/5 lg:w-1/5 text-white rounded-xl flex flex-col justify-center items-center space-y-1"
          >
            <div className="h-1/5 w-full border-b-2 border-pink-500 text-center py-1 text-lg font-semibold">
              Lab&#39;s Config
            </div>
            <Link
              href={"/dashboard-pathologist/pathology/ConfigAddReport"}
              className="h-2/5 flex justify-center items-center gap-2 border-b-2 border-pink-500 hover:bg-pink-700 w-full rounded-xl"
            >
              <MdOutlineAddChart size={30} />
              <div className="text-xl font-bold text-white">Add Lab Test</div>
            </Link>
            <Link
              href={"/dashboard-pathologist/pathology/ConfigAddUnit"}
              className="h-2/5 flex justify-center items-center gap-2 border-b-2 border-pink-500 hover:bg-pink-700 w-full rounded-xl"
            >
              <GiThermometerScale size={30} />
              <div className="text-xl font-bold text-white">Lab Units</div>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Page;
