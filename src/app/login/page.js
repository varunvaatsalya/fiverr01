"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";

function Page() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Sending data as JSON
      let result = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify(data), // Properly stringify the data
      });

      // Parsing the response as JSON
      result = await result.json();

      // Check if login was successful
      if (result.success) {
        console.log("Login successful, redirecting...", result.route);
        router.push(result.route);
      } else {
        console.error("Login failed:", result.message);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className=" flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 bg-gray-200 text-black flex items-center justify-center">
        <div className="max-w-3xl py-6 px-10 mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          <h2 className="text-3xl font-bold mb-2 text-center dark:text-gray-900">
            Register your Company
          </h2>
          <div className="text-lg text-gray-600 text-center">
            Please enter your Company Details
          </div>
          {/* New Form Code Start */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-2xl mx-auto space-y-4 bg-white px-8 py-6 rounded-lg shadow-lg"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-black"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email", { required: "Email is required" })}
                className="mt-1 block w-full px-4 py-3 bg-white border border-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition duration-150 ease-in-out"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-black"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password", { required: "Password is required" })}
                className="mt-1 block w-full px-4 py-3 bg-white border border-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition duration-150 ease-in-out"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-semibold text-black"
              >
                Role
              </label>
              <select
                id="role"
                {...register("role", { required: "Role is required" })}
                className="my-2 block w-full px-4 py-3 bg-white border border-black rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition duration-150 ease-in-out"
              >
                <option value="SalesMan">Sales Man</option>
                <option value="Owner">Owner</option>
                <option value="Admin">Admin</option>
              </select>
              {errors.role && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.role.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-6 border border-black rounded-md shadow-sm text-base font-semibold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150 ease-in-out cursor-pointer"
              disabled={submitting}
            >
              {submitting ? (
                <Loading size={20} className="text-pink-400" />
              ) : (
                <></>
              )}
              {submitting ? "Logging In..." : "Log In"}
            </button>
          </form>
          {/* New Form Code End */}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Page;
