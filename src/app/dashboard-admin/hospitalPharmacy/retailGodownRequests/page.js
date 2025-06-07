"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import RequestSearchList from "@/app/components/RequestSearchList";

function Page() {
  const [stockRequests, setStockRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  useEffect(() => {
    async function fetchData(page) {
      try {
        fetch(`/api/stockRequest?page=${page}&sectionType=hospital`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setStockRequests(data.requests);
              setTotalPages(data.totalPages);
            } else console.log(data.message);
          });
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData(page);
  }, [page]);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar route={["Pharmacy", "Requests"]} />
      <RequestSearchList
        stockRequests={stockRequests}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />
    </div>
  );
}

export default Page;
