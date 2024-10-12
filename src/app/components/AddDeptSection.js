"use client";
import React, { useState } from "react";
import NewDeptForm from "./NewDeptForm";
import EditDeptForm from "./EditDeptForm";

function AddDeptSection({ setNewUserSection, departments, setDepartments }) {
  const [mode, setMode] = useState(null);
  return (
    <>
      <div className="absolute top-0 left-0">
        <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
          <div className="w-[95%] md:w-1/2 py-4 text-center bg-slate-950 px-4 rounded-xl">
            {!mode && (
              <div className=" space-y-3 font-semibold text-xl">
                <div className="text-center">Choose the mode</div>
                <button
                  onClick={() => {
                    setMode(1);
                  }}
                  className="rounded-xl w-full p-4 bg-slate-800"
                >
                  Add New Department
                </button>
                <button
                  onClick={() => {
                    setMode(-1);
                  }}
                  className="rounded-xl w-full p-4 bg-slate-800"
                >
                  Edit Current Department
                </button>
                <hr className="border border-slate-800 w-full my-2" />
                <button
                  className="p-2 border text-white border-slate-700 rounded-lg font-semibold"
                  onClick={() => {
                    setNewUserSection((prev) => !prev);
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
            {mode === 1 && (
              <NewDeptForm
                setNewUserSection={setNewUserSection}
                departments={departments}
                setDepartments={setDepartments}
              />
            )}
            {mode === -1 && (
              <EditDeptForm
                setNewUserSection={setNewUserSection}
                departments={departments}
                setDepartments={setDepartments}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AddDeptSection;
