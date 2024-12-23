import Link from "next/link";

export default function Navbar({ route }) {
  return (
    <header className="bg-slate-900 text-white p-4 sm:px-6 lg:px-8">
      <Link href={'./'} className="container mx-auto flex items-center lg:text-2xl font-bold hover:text-gray-300">
        <div>Shivam Akshayvat</div>
        {route?.map((name, index) => {
          return (
            <div key={index} className="flex items-center">
              <div className="mx-1 text-sm">
                &gt;
              </div>
              <div>{name}</div>
            </div>
          );
        })}
      </Link>
    </header>
  );
}
