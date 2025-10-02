import Link from "next/link";
import RedisStatus from "./RedisStatus"
import LoggedInUser from "./LoggedInUser";

export default function Navbar({ route }) {
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
      </Link>
      <RedisStatus />
      <LoggedInUser />
    </header>
  );
}
