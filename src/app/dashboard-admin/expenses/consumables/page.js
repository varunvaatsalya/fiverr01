"use client";
import { useEffect, useState } from "react";
import ExpensesList from "../../../components/ExpensesList";

function Page() {
  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch(`/api/expense?page=${1}`);
        result = await result.json();
        if (result.success) {
          setExpenses(result.expenses);
          setTotalPages(result.totalPages);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, [page]);
  
  return (
    <>
      <ExpensesList
        expenses={expenses}
        setExpenses={setExpenses}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />
    </>
  );
}

export default Page;
