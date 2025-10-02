import Link from "next/link";
import LoggedInUser from "./LoggedInUser";
// import { isRedisConnected } from "../lib/redis";

export default function Navbar({ route }) {
  // const redisStatus = isRedisConnected() || false;
  return (
    <header className="bg-slate-900 text-white p-4 sm:px-6 lg:px-8 flex justify-between items-center gap-2">
      <Link
        href={"./"}
        className="container mx-auto flex flex-wrap items-center text-sm sm:text-lg lg:text-2xl font-bold hover:text-gray-300"
      >
        <div className="text-nowrap">Shivam Akshayvat</div>
        {route?.map((name, index) => {
          return (
            <div key={index} className="flex items-center">
              <div className="mx-1 text-sm">&gt;</div>
              <div className="text-nowrap">{name}</div>
            </div>
          );
        })}
        {/* <div className="text-xs">
          {redisStatus ? "Redis Connected" : "Redis Not Connected"}
        </div> */}
      </Link>
      <LoggedInUser />
    </header>
  );
}
