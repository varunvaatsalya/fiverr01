"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { showError } from "../utils/toast";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

function AdvExpenseSearch({ searchedExpense, setSearchedExpense }) {
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [lastFormData, setLastFormData] = useState(null);
  const [page, setPage] = useState(1);
  const { register, handleSubmit, watch } = useForm();

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/expense/categories");
        result = await result.json();
        if (result.success) {
          setCategories(result.categories);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);

  //   advPrescSerch

  const onSubmit = async (data) => {
    setSubmitting(true);
    setLastFormData(data);
    try {
      let result = await fetch("/api/expense/advExpenseSearch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the header for JSON
        },
        body: JSON.stringify({ ...data, page }), // Properly stringify the data
      });

      // Parsing the response as JSON
      result = await result.json();
      // Check if login was successful
      if (result.success) {
        setSearchedExpense(result.expenses);
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (lastFormData) {
      onSubmit(lastFormData);
    }
  }, [page]);

  const selectedCategoryName = watch("category");

  // Get the selected category object
  const selectedCategory = categories.find(
    (cat) => cat.name === selectedCategoryName
  );

  const handleNextPage = () => {
    if (searchedExpense && searchedExpense.length === 50) {
      setPage(page + 1);
    }
  };
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-wrap justify-center items-center gap-3 p-3 border-t bg-slate-900 border-gray-800"
    >
      <select
        id="categories"
        {...register("category")}
        className="mt-1 block px-4 py-3 text-white w-48 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      >
        <option value="">Select a Category</option>
        {categories.map((category, index) => (
          <option key={index} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>
      {selectedCategory?.subCategory?.length > 0 && (
        <select
          {...register("subCategory")}
          className="mt-1 block px-4 py-3 text-white w-48 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        >
          <option value="">Select a subcategory</option>
          {selectedCategory?.subCategory.map((sub, index) => (
            <option key={index} value={sub.name}>
              {sub.name}
            </option>
          ))}
        </select>
      )}
      <input
        id="amount"
        type="text"
        placeholder={"Amount"}
        {...register("amount")}
        className="mt-1 block text-white w-48 px-4 py-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      />
      <div className="flex flex-col lg:flex-row justify-center items-center gap-x-2">
        <label
          htmlFor="sdate"
          className=" text-sm lg:text-base font-medium text-gray-100"
        >
          Start Date
        </label>
        <input
          id="sdate"
          type="datetime-local"
          {...register("startDate")}
          className="block text-white p-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
      </div>
      <div className="flex flex-col lg:flex-row justify-center items-center gap-x-2">
        <label
          htmlFor="edate"
          className=" text-sm lg:text-base font-medium text-gray-100"
        >
          End Date
        </label>
        <input
          id="edate"
          type="datetime-local"
          {...register("endDate")}
          className="block text-white p-2 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
      </div>

      <button
        type="submit"
        className="px-3 py-1 flex items-center justify-center gap-2 bg-blue-500 rounded-lg font-semibold cursor-pointer text-white"
      >
        {submitting ? "Searching..." : "Search"}
      </button>
      <div className="bg-gray-700 rounded-lg py-1">
        <button
          onClick={handlePreviousPage}
          disabled={page === 1}
          className="px-2 py-1"
        >
          <FaArrowLeft size={10} />
        </button>
        <span className="text-white text-xs border-x border-white px-2 py-1">
          Page {page}
        </span>
        <button
          onClick={handleNextPage}
          disabled={!searchedExpense || searchedExpense.length < 50}
          className="px-2 py-1"
        >
          <FaArrowRight size={10} />
        </button>
      </div>
    </form>
  );
}

export default AdvExpenseSearch;
