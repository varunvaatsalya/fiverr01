"use client";
import { formatDateToIST } from "../utils/date";

function PrescriptionList({ setNewUserSection, setEntity, prescriptions1 }) {
  const prescriptions = [
    {
      pid: 1245,
      doctor: { name: "varun gupta" },
      department: { name: "nurology" },
      itmes: [
        { name: "x-ray", price: 125 },
        { name: "ct-scan", price: 215 },
      ],
      createdAt: "2024-10-12T15:39:20.000+00:00",
    },
    {
      pid: 1245,
      doctor: { name: "shiv shankar" },
      department: { name: "brianology" },
      itmes: [
        { name: "x-ray", price: 125 },
        { name: "ct-scan", price: 215 },
      ],
      createdAt: "2024-10-15T15:39:20.000+00:00",
    },
    {
      pid: 1245,
      doctor: { name: "varun gupta" },
      department: { name: "nurology" },
      itmes: [
        { name: "x-ray", price: 125 },
        { name: "ct-scan", price: 215 },
      ],
      createdAt: "2024-10-12T15:39:20.000+00:00",
    },
  ];

  function handleResetPrescriptionSection(){
    setEntity(null);
    setNewUserSection((prev) => !prev);
  }

  return (
    <div className="">
      <h2 className="font-bold text-xl text-white">
        Prescription Details of <span className="text-blue-500">Patient</span>
      </h2>
      <div className="flex flex-wrap justify-around">
        <div className="py-1 px-4 ">
          Patient Name:{" "}
          <span className="text-blue-500 font-semibold">Varun Gupta</span>
        </div>
        <div className="py-1 px-4 ">
          UHID:{" "}
          <span className="text-blue-500 font-semibold capitalize">125478</span>
        </div>
      </div>
      <hr className="border border-slate-800 w-full my-2" />

      <div className="w-4/5 px-2 mx-auto my-2 max-h-[60vh] overflow-auto space-y-2">
        {prescriptions.map((prescription, index) => {
          return (
            <div
              className="p-3 rounded-lg border-2 border-gray-800"
              key={index}
            >
              <div className="flex flex-wrap justify-around border-b-2 border-gray-800">
                <div className="py-1 px-4 ">
                  PID:{" "}
                  <span className="text-blue-500 font-semibold capitalize">
                    {prescription.pid}
                  </span>
                </div>
                <div className="py-1 px-4 ">
                  Doctor:{" "}
                  <span className="text-blue-500 font-semibold">
                    {prescription.doctor.name}
                  </span>
                </div>
                <div className="py-1 px-4">
                  Department:{" "}
                  <span className="text-blue-500 font-semibold">{prescription.department.name}</span>
                </div>
              </div>
              {prescription.itmes.map((item, it) => {
                return (
                  <div className="border-b-2 w-4/5 mx-auto border-gray-800 flex" key={it}>
                    <div className="w-1/2 p-2">{item.name}</div>
                    <div className="w-1/2 p-2">{item.price}</div>
                  </div>
                );
              })}
              <div className="text-gray-500 text-sm">
                Created at {formatDateToIST(prescription.createdAt)}
              </div>
            </div>
          );
        })}
      </div>
      <hr className="border border-slate-800 w-full my-2" />
      <div
        className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer mx-auto"
        onClick={handleResetPrescriptionSection}
      >
        Close
      </div>
    </div>
  );
}

export default PrescriptionList;
