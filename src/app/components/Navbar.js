import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="bg-slate-950 text-white p-4 sm:px-6 lg:px-8">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Company
          </Link>
          <div className="">
            <Link href="/login" className="hover:underline text-lg mx-2">
              Members LogIn
            </Link>
          </div>
        </nav>
      </header>
  )
}