"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { IoBookmark } from "react-icons/io5";

function Page() {
  const [wardBeds, setWardBeds] = useState([]);
  const [resData, setResData] = useState([]);
  const [filterByOccupied, setFilterByOccupied] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/wardbed");
        result = await result.json();
        if (result.success) {
          setWardBeds(result.wardBeds);
          setResData(result.wardBeds);
          // console.log(result.wardBeds);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const filteredWards = wardBeds
      .map((ward) => {
        const filteredBeds = ward.beds.filter((bed) => {
          if (filterByOccupied !== null && bed.isOccupied !== filterByOccupied)
            return false;
          
          const bedName = bed.name?.toLowerCase() || "";
          const wardName = ward.name?.toLowerCase() || "";
          const patientName =
            bed.occupancy?.patientId?.name?.toLowerCase() || "";

          const search = query?.toLowerCase() || "";

          return (
            bedName.includes(search) ||
            wardName.includes(search) ||
            patientName.includes(search)
          );
        });

        return {
          ...ward,
          beds: filteredBeds,
        };
      })
      .filter((ward) => ward.beds.length > 0);

    setResData(filteredWards);
  }, [filterByOccupied, query, wardBeds]);

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-200">
        <Navbar route={["IPD", "Works"]} />
        <main className="flex-grow">
          <div className="px-2 lg:px-4 max-w-screen-xl mx-auto">
            <div className="h-16 py-2 flex justify-center gap-2 items-center">
              <input
                type="text"
                placeholder="Search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                className="h-full w-full my-3 text-black text-xl font-medium px-4 rounded-full outline-none bg-gray-300 border-b-2 border-gray-400 focus:bg-gray-400"
              />
              <button
                onClick={() => {
                  setFilterByOccupied((prev) => (prev === true ? null : true));
                }}
                className="flex justify-center items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 h-full rounded-full font-semibold"
              >
                {filterByOccupied && <IoBookmark />}
                <div>Occupied</div>
              </button>
              <button
                onClick={() => {
                  setFilterByOccupied((prev) =>
                    prev === false ? null : false
                  );
                }}
                className="flex justify-center items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 h-full rounded-full font-semibold"
              >
                {filterByOccupied == false && <IoBookmark />}
                <div>available</div>
              </button>
            </div>
            {resData.map((wards, index) => (
              <div className="w-full md:w-[90%] mx-auto px-2" key={index}>
                <div className="w-full md:w-3/4 py-3 text-lg font-bold mx-auto text-center rounded-full bg-black text-white">
                  {wards.name}
                </div>

                <div className="flex flex-wrap justify-center w-full gap-3 p-3">
                  {wards.beds.map((wardBed, it) => {
                    return (
                      <div
                        className={
                          "w-full md:w-[45%] flex items-center rounded-xl bg-black text-white " +
                          (wardBed.isOccupied ? "bg-red-600" : "bg-green-600")
                        }
                        key={it}
                      >
                        <div className={"w-full py-1 "}>
                          <div className="font-bold text-xl text-center">
                            {wardBed.bedName}
                          </div>
                          <div className="capitalize text-center">
                            {wardBed.occupancy?.patientId
                              ? wardBed.occupancy?.patientId.name +
                                ", " +
                                wardBed.occupancy?.patientId.uhid
                              : "Available"}
                          </div>
                        </div>
                        <Link
                          href={`ipdWorks/${wardBed._id}`}
                          className="w-20 h-full py-2 px-1 bg-gray-900 rounded-r-xl text-white flex justify-center items-center text-center"
                        >
                          OPEN
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default Page;
