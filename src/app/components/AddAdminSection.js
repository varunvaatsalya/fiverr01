import React from "react";
import NewAdminForm from "./NewAdminForm";

function AddAdminSection({ setNewUserSection, setAdmins }) {
  return (
    <>
      <div className="absolute top-0 left-0">
        <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
          <div className="w-[95%] md:w-1/2 py-4 text-center bg-slate-950 px-4 rounded-xl">
            <NewAdminForm
              setNewUserSection={setNewUserSection}
              setAdmins={setAdmins}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default AddAdminSection;
