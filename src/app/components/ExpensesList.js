"use client";
import React, { useState } from "react";
import AddExpenseSection from "./AddExpenseSection";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { IoPersonAdd } from "react-icons/io5";
import { formatDateToIST, formatTimeToIST } from "../utils/date";

function ExpensesList({ expenses, setExpenses }) {
  const [newUserSection, setNewUserSection] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const fakeExpenses = [
    {
      name: "filter",
      amount: 6400,
      quantity: 2,
      validity: "23/05/2025",
      message: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ratione sunt nisi accusantium amet ipsa ab, laborum magni sit suscipit a illum accusamus id quibusdam? Corrupti quam et, inventore obcaecati dolores tempore ipsam. Hic necessitatibus blanditiis recusandae quo possimus unde, fugit provident officia ad ipsum iste nostrum quaerat molestiae debitis odio cupiditate aliquid.",
    },
    {
      name: "Gas",
      amount: 5200,
      quantity: 2,
      validity: "23/05/2025",
      message: "",
    },
    {
      name: "filter",
      amount: 6400,
      quantity: 2,
      validity: "23/05/2025",
      message: "",
    },
    {
      name: "filter",
      amount: 6400,
      quantity: 2,
      validity: "23/05/2025",
      message: "",
    },
    {
      name: "filter",
      amount: 6400,
      quantity: 2,
      validity: "23/05/2025",
      message: "",
    },
  ];


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
        <Navbar route={["Expenses"]} />
        <main className="flex-grow">
          <div className="px-2 lg:px-4 max-w-screen-xl mx-auto">
            <div className="h-16 py-2 flex justify-center gap-2 items-center">
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
            <div className="h-12 px-2 md:w-3/4 mx-auto text-sm md:text-base flex rounded-full bg-black text-white">
              <div className="md:w-[8%] justify-center px-2 flex items-center pl-2">
                No.
              </div>
              <div className="w-2/5 flex items-center ">Name</div>
              <div className="w-1/5 flex items-center justify-center ">
                Amount
              </div>
              <div className="w-1/5 flex items-center justify-center ">
                Date
              </div>
            </div>
            {expenses.map((expense, index) => {
              return (
                <div className=" text-black mx-auto md:w-3/4" key={index + 1}>
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
                    <div className="w-1/5 flex items-center justify-center">
                      {formatDateToIST(expense.createdAt)}
                    </div>
                    <span className="text-gray-500 mx-auto">
                      {activeIndex === index ? "-" : "+"}
                    </span>
                  </div>
                  {activeIndex === index && (
                    <div className="w-full p-2 bg-gray-200 rounded-xl">
                      <div className="flex flex-wrap justify-around">
                        <div className="py-1 px-4 ">
                          Time:{" "}
                          <span className="text-blue-500 font-semibold capitalize">
                            {formatTimeToIST(expense.createdAt)}
                          </span>
                        </div>
                        <div className="py-1 px-4 ">
                          Quantity:{" "}
                          <span className="text-blue-500 font-semibold capitalize">
                            {expense.quantity}
                          </span>
                        </div>
                        <div className="py-1 px-4 ">
                          Validity:{" "}
                          <span className="text-blue-500 font-semibold capitalize">
                            {expense.validity}
                          </span>
                        </div>
                      </div>
                      <div className="mx-auto text-center">
                        Message:{" "}
                        <span className="text-blue-500 font-semibold">
                          {expense.expenseMessage}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default ExpensesList;
