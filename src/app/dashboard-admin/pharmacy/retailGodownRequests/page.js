"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import RequestSearchList from "@/app/components/RequestSearchList";

function Page() {
  const [stockRequests, setStockRequests] = useState([]);
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 700);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    async function fetchData(page) {
      try {
        fetch(
          `/api/stockRequest?page=${page}&status=${selectedStatus}&query=${encodeURIComponent(
            debouncedQuery
          )}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setStockRequests(data.requests);
              if (data.limit) setLimit(data.limit);
            } else console.log(data.message);
          });
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData(page);
  }, [page, debouncedQuery, selectedStatus]);
  return (
    <div className="min-h-screen h-screen flex flex-col">
      <Navbar route={["Pharmacy", "Requests"]} />
      <RequestSearchList
        stockRequests={stockRequests}
        limit={limit}
        page={page}
        setPage={setPage}
        query={query}
        setQuery={setQuery}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />
    </div>
  );
}

export default Page;
