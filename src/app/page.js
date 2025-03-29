"use client";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
// NODE_OPTIONS="--max-old-space-size=4096" npm run build -- for build
// pm2 restart fiverr01-app -- for start server


export default function Home() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [route, setRoute] = useState("/login");
  useEffect(() => {
    async function fetchRoute() {
      try {
        let result = await fetch("/api/auth");
        result = await result.json();
        if (result.success) {
          setSuccess(result.success);
          setRoute(result.route);
        }
        router.push(result.route);
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchRoute();
  }, []);
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
          {success ? (
            <Link
              href={route}
              className="bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
