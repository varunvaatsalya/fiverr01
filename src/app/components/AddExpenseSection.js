import React from "react";
import NewExpenseForm from "./NewExpenseForm";

function AddExpenseSection({ setNewUserSection, setExpenses }) {
  return (
    <>
      <div className="absolute top-0 left-0">
        <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
          <div className="w-[95%] md:w-1/2 py-4 text-center bg-slate-950 px-4 rounded-xl">
            <NewExpenseForm
              setNewUserSection={setNewUserSection}
              setExpenses={setExpenses}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default AddExpenseSection;
