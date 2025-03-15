"use client";
import { IoPersonAdd } from "react-icons/io5";
import Navbar from "../../../components/Navbar";
import React, { useEffect, useState } from "react";
import Loading from "../../../components/Loading";
import { FaRegEdit } from "react-icons/fa";
import { useFieldArray, useForm } from "react-hook-form";

function Page() {
  const [categories, setCategories] = useState([]);
  const [resData, setResData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [newCategorySection, setNewCategorySection] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      subCategory: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "subCategory",
  });

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
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    setResData(categories);
  }, [categories]);

  function updatedata(query) {
    let filterRes = categories.filter((category) => {
      let lowerCaseQuery = query.toLowerCase();
      let isCategoryNameMatch = category.name
        .toLowerCase()
        .includes(lowerCaseQuery);
      let isSuCatMatch = category.subCategory.some((item) =>
        item.name.toLowerCase().includes(lowerCaseQuery)
      );
      return isCategoryNameMatch || isSuCatMatch;
    });
    setResData(filterRes);
  }

  const onSubmit = async (data) => {
    console.log(data);
    reset();
    setSubmitting(true);
    try {
      let result = await fetch("/api/expense/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      result = await result.json();

      if (result.success) {
        setCategories((prevCategories) => [result.category, ...prevCategories]);
        setNewCategorySection((prev) => !prev);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
      setTimeout(() => {
        setMessage("");
      }, 3500);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar route={["Expense", "Category"]} />
      {newCategorySection && (
        <div className="absolute top-0 left-0">
          <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-[95%] md:w-4/5 lg:w-3/5 py-4 text-center bg-slate-950 px-4 rounded-xl"
            >
              <h2 className="font-bold text-2xl text-white">
                Details of new <span className="text-blue-500">Category</span>
              </h2>
              <hr className="border border-slate-800 w-full my-2" />
              {message && (
                <div className="my-1 text-center text-red-500">{message}</div>
              )}
              <input
                {...register("name", { required: true })}
                type="text"
                id="name"
                className="mt-1 block px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                placeholder="Enter Category name"
              />

              <div>
                <h3 className="font-semibold text-lg text-gray-100 py-2">
                  Sub Categories
                </h3>
                {fields.length === 0 && (
                  <p className="text-gray-500">
                    No Sub Category added yet. Click <u>Add</u> to start.
                  </p>
                )}
                <div className="max-h-[50vh] overflow-y-auto px-3 space-y-2 py-1">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3">
                      {/* Item Name */}
                      <div className="flex-1">
                        <input
                          {...register(`subCategory[${index}].name`, {
                            required: true,
                          })}
                          type="text"
                          placeholder="Sub Category Name"
                          className=" px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                        />
                      </div>
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 font-semibold hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  {/* Add New Item Button */}
                  <button
                    type="button"
                    onClick={() => append({ name: "" })}
                    className="p-2 bg-blue-500 rounded-lg font-semibold text-white"
                  >
                    Add Sub Category
                  </button>
                </div>
              </div>
              <hr className="border border-slate-800 w-full my-2" />
              <div className="flex px-4 gap-3 justify-end">
                <div
                  className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
                  onClick={() => {
                    reset();
                    setNewCategorySection((prev) => !prev);
                  }}
                >
                  Cancel
                </div>
                <button
                  type="submit"
                  className="w-20 h-8 py-1 flex items-center justify-center gap-2 bg-red-500 rounded-lg font-semibold cursor-pointer text-white"
                  disabled={submitting}
                >
                  {submitting ? <Loading size={15} /> : <></>}
                  {submitting ? "Wait..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
                setNewCategorySection(
                  (newCategorySection) => !newCategorySection
                );
              }}
              className="flex justify-center items-center gap-2 bg-black hover:bg-gray-800 text-white px-8 h-full rounded-full font-semibold"
            >
              <IoPersonAdd />
              <div>Add</div>
            </button>
          </div>
          <div className="h-12 flex justify-center items-center lg:text-xl rounded-full w-3/4 mx-auto bg-black text-white">
            Consumable Expense Categories, their SubCategories
          </div>
          {resData.map((category, index) => (
            <div key={index} className="text-black md:w-3/4 mx-auto">
              {/* Department Header */}
              <div
                className="px-4 py-2 cursor-pointer border-b-2 border-gray-300 hover:rounded-full hover:bg-gray-300 flex justify-between items-center"
                onClick={() =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
              >
                <h3 className="font-semibold text-lg capitalize">
                  {category.name}
                </h3>
                <span className="text-gray-500">
                  {activeIndex === index ? (
                    <div className="flex items-center gap-2">
                      <FaRegEdit
                        onClick={() => {}}
                        className="size-5 text-gray-900 hover:text-gray-600"
                      />
                      <div>-</div>
                    </div>
                  ) : (
                    "+"
                  )}
                </span>
              </div>

              {activeIndex === index && (
                <div className="px-2">
                  {category.subCategory.length > 0 ? (
                    category.subCategory.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="px-4 py-2 flex justify-between bg-white border-b-2 border-gray-300 rounded-full"
                      >
                        <span>{item.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 flex justify-between bg-red-100 border-b-2 border-red-300 rounded-full">
                      <span>No Any Sub Category</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Page;
