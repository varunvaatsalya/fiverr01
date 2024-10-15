import Link from "next/link";

export default function Navbar({route}) {
  return (
    <header className="bg-slate-950 text-white p-4 sm:px-6 lg:px-8">
      <nav className="container mx-auto flex items-center lg:text-2xl font-bold">
        <Link href="/">Company</Link>
        {route?.map((name, index) => {
          return (
            <>
              <div key={index} className="mx-1 text-sm">&gt;</div>
              <div>{name}</div>
            </>
          );
        })}
      </nav>
    </header>
  );
}
