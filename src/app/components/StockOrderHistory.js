"use client";
import React, { useEffect, useState } from "react";
import { formatDateTimeToIST } from "../utils/date";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

function StockOrderHistory() {
  const [orderHistories, setOrderHistories] = useState([]);
  const [totalPages, setTotalPages] = useState([]);
  const [page, setPage] = useState(1);
  const [resData, setResData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    fetch(`/api/orderStock${"?info=1"}&page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setOrderHistories(data.orderHistory);
        setResData(data.orderHistory);
        setTotalPages(data.totalPages);
      });
  }, [page]);

  function updatedata(query) {
    let filterRes = orderHistories.filter((history) => {
      let lowerCaseQuery = query.toLowerCase();
      return (
        history.to.toLowerCase().includes(lowerCaseQuery) ||
        history.mrName?.toLowerCase().includes(lowerCaseQuery) ||
        history.contact?.toString().includes(lowerCaseQuery)
      );
    });
    setResData(filterRes);
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <>
      <div className="flex-grow">
        <div className="px-2 lg:px-4 max-w-screen-xl mx-auto">
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => {
              updatedata(e.target.value);
            }}
            className=" w-full my-2 py-2 text-black text-xl font-medium px-4 rounded-full outline-none bg-gray-300 border-b-2 border-gray-400 focus:bg-gray-400"
          />
          <div className="h-12 flex justify-center items-center text-xl rounded-full w-3/4 mx-auto bg-black text-white">
            Order History Details
          </div>
          {resData.length > 0 ? (
            resData.map((history, index) => (
              <div key={index} className="text-black md:w-3/4 mx-auto">
                {/* Patient Header */}
                <div
                  className="px-4 py-2 cursor-pointer border-b-2 border-gray-300 hover:rounded-full hover:bg-gray-300 flex justify-between items-center"
                  onClick={() =>
                    setActiveIndex(activeIndex === index ? null : index)
                  }
                >
                  <div className="">{index + 1}</div>
                  <h3 className="font-semibold text-lg capitalize">
                    {history.to}
                  </h3>
                  <div className="">
                    {formatDateTimeToIST(history.createdAt)}
                  </div>
                  <span className="text-gray-500">
                    {activeIndex === index ? "-" : "+"}
                  </span>
                </div>

                {/* Patient Items (Shown when expanded) */}
                {activeIndex === index && (
                  <div className="w-full p-2 bg-gray-200 rounded-b-xl ">
                    <div className="flex flex-wrap gap-2 justify-around border-b-2 border-gray-300 py-2">
                      <div className="">
                        MR:{" "}
                        <span className="text-blue-500 font-semibold">
                          {history.mrName ? history.mrName : "--"}
                        </span>
                      </div>
                      <div className="">
                        Contact:{" "}
                        <span className="text-blue-500 font-semibold capitalize">
                          {history.contact}
                        </span>
                      </div>
                    </div>
                    {history.medicines.map((medicine, index) => (
                      <div
                        key={index}
                        className="flex justify-around capitalize items-center bg-gray-300 rounded-lg my-0.5"
                      >
                        <div className="w-3/5 text-center">{medicine.name}</div>
                        <div className="w-2/5 text-center">{medicine.quantity}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-lg text-center font-semibold">
              No data Avilable
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end pr-4 gap-3">
        <div className="bg-gray-900 rounded-lg">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1}
            className="p-3"
          >
            <FaArrowLeft size={20} />
          </button>
          <span className="text-white border-x border-white p-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="p-3"
          >
            <FaArrowRight size={20} />
          </button>
        </div>
      </div>
    </>
  );
}

export default StockOrderHistory;
