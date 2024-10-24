"use client";
import { useEffect, useState } from "react";
import ExpensesList from "../../components/ExpensesList";

function Page() {
  const [expenses, setExpenses] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/expense");
        result = await result.json();
        if (result.success) {
          setExpenses(result.expenses);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);
  return (
    <>
      <ExpensesList
        expenses={expenses}
        setExpenses={setExpenses}
      />
    </>
  );
}

export default Page;
