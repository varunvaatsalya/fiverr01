import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-2 bg-gray-200 text-black flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Welcome to Company
          </h1>
          <p className="text-xl mb-10 text-gray-700">
            Simplify your billing process with our easy-to-use platform.
          </p>
          <Link
            href="/login"
            className="bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/dashboard-admin"
            className="bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            admin
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
