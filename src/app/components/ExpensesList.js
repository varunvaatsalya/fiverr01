"use client";
import React, { useEffect, useState } from "react";
import AddExpenseSection from "./AddExpenseSection";
import AdvExpenseSearch from "./AdvExpenseSearch";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { IoPersonAdd } from "react-icons/io5";
import { formatDateTimeToIST } from "../utils/date";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

function ExpensesList({ expenses, setExpenses, page, setPage, totalPages }) {
  const [newUserSection, setNewUserSection] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchedExpense, setSearchedExpense] = useState(null);
  const [copyExpenses, setCopyExpenses] = useState(expenses);
  const [resData, setResData] = useState(expenses);
  const [advSearch, setAdvSearch] = useState(false);

  useEffect(() => {
    setResData(copyExpenses);
  }, [copyExpenses]);

  useEffect(() => {
    if (searchedExpense) {
      setCopyExpenses(searchedExpense);
    } else {
      setCopyExpenses(expenses);
    }
  }, [searchedExpense, expenses]);

  function updatedata(query) {
    let filterRes = copyExpenses.filter((expense) => {
      let lowerCaseQuery = query.toLowerCase();
      return (
        expense.name.toLowerCase().includes(lowerCaseQuery) ||
        expense.category?.toLowerCase().includes(lowerCaseQuery) ||
        expense.subCategory?.toLowerCase().includes(lowerCaseQuery) ||
        expense.expenseMessage.toLowerCase().includes(lowerCaseQuery) ||
        expense.amount.toString().includes(lowerCaseQuery)
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
      {newUserSection ? (
        <AddExpenseSection
          setNewUserSection={setNewUserSection}
          setExpenses={setExpenses}
        />
      ) : (
        <></>
      )}
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navbar route={["Expenses", "Consumable"]} />
        <main className="flex-grow">
          <div className="px-2 lg:px-4 max-w-screen-xl mx-auto">
            <div className="h-16 py-2 flex justify-center gap-2 items-center">
              <input
                type="text"
                placeholder="Search"
                onChange={(e) => {
                  updatedata(e.target.value);
                }}
                className="h-full w-full my-3 text-black text-xl font-medium px-4 rounded-full outline-none bg-gray-300 border-b-2 border-gray-400 focus:bg-gray-400"
              />
              <button
                onClick={() => {
                  setNewUserSection((newUserSection) => !newUserSection);
                }}
                className="flex justify-center items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 h-full rounded-full font-semibold"
              >
                <IoPersonAdd />
                <div>Add</div>
              </button>
            </div>
            <div className="h-12 px-2 md:w-4/5 mx-auto text-sm md:text-base flex rounded-full bg-black text-white">
              <div className="md:w-[8%] justify-center px-2 flex items-center pl-2">
                No.
              </div>
              <div className="w-2/5 flex items-center ">Name</div>
              <div className="w-1/5 flex items-center justify-center ">
                Amount
              </div>
              <div className="w-1/4 flex items-center justify-center ">
                Date
              </div>
            </div>
            {resData.map((expense, index) => {
              return (
                <div className=" text-black mx-auto md:w-4/5" key={index + 1}>
                  <div
                    className="h-12 px-4 text-sm md:text-base flex hover:rounded-full border-b-2 border-gray-300 w-full cursor-pointer hover:bg-gray-200 items-center"
                    onClick={() =>
                      setActiveIndex(activeIndex === index ? null : index)
                    }
                  >
                    <div className="w-[8%] px-2 flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="w-2/5 flex items-center">
                      {expense.name}
                    </div>
                    <div className="w-1/5 flex items-center justify-center">
                      {expense.amount}
                    </div>
                    <div className="w-1/4 flex items-center justify-center">
                      {formatDateTimeToIST(expense.createdAt)}
                    </div>
                    <span className="text-gray-500 mx-auto">
                      {activeIndex === index ? "-" : "+"}
                    </span>
                  </div>
                  {activeIndex === index && (
                    <div className="w-full p-2 bg-gray-200 rounded-xl">
                      <div className="flex flex-wrap justify-around">
                        {expense.category && (
                          <div className="py-1 px-4 ">
                            Category:{" "}
                            <span className="text-blue-500 font-semibold capitalize">
                              {expense.category}
                            </span>
                          </div>
                        )}
                        {expense.subCategory && (
                          <div className="py-1 px-4 ">
                            Sub Category:{" "}
                            <span className="text-blue-500 font-semibold capitalize">
                              {expense.subCategory}
                            </span>
                          </div>
                        )}
                        {expense.quantity && (
                          <div className="py-1 px-4 ">
                            Quantity:{" "}
                            <span className="text-blue-500 font-semibold capitalize">
                              {expense.quantity}
                            </span>
                          </div>
                        )}
                        {expense.validity && (
                          <div className="py-1 px-4 ">
                            Validity:{" "}
                            <span className="text-blue-500 font-semibold capitalize">
                              {expense.validity}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mx-auto text-center">
                        Message:{" "}
                        <span className="text-blue-500 font-semibold">
                          {expense.expenseMessage
                            ? expense.expenseMessage
                            : "----"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
        <div className="flex justify-end pr-4 gap-3">
          <div
            className="px-4 py-3 bg-gray-900 text-white text-lg rounded-lg font-bold cursor-pointer"
            onClick={() => {
              if (advSearch) {
                setSearchedExpense(null);
              }
              setAdvSearch(!advSearch);
            }}
          >
            {advSearch ? "Close" : "Advanced Search"}
          </div>
          {!advSearch && (
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
          )}
        </div>
        {advSearch && (
          <AdvExpenseSearch searchedExpense={searchedExpense} setSearchedExpense={setSearchedExpense} />
        )}
        <Footer />
      </div>
    </>
  );
}

export default ExpensesList;
