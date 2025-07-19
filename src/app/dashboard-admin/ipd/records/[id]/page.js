"use client";
import React, { useEffect, useState } from "react";
import Loading from "../../../../components/Loading";
import IpdInvoice from "../../../../components/IpdInvoice";
import Navbar from "../../../../components/Navbar";
import { FaCircleLeft } from "react-icons/fa6";
import AdmissionRecordsForm from "../../../../components/AdmissionRecordsForm";
import { Button } from "@/components/ui/button";

let details = {
  ward: { name: "icu" },
  bedName: "icu1",
  isOccupied: true,
  price: 145,
  occupancy: {
    patientId: { name: "varun", uhid: "pt1254" },
    startDate: "145245874",
  },
};

function Page({ params }) {
  const id = params.id;
  const [admission, setAdmission] = useState(null);
  const [printInvoice, setPrintInvoice] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch(`/api/ipdRecords?id=${id}`);
        result = await result.json();
        if (result.success) {
          setAdmission(result.admission);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);

  if (!admission) {
    return (
      <div className="bg-black min-h-screen flex flex-col justify-center items-center text-white ">
        <Loading size={70} />
        <div className="text-3xl font-bold my-2">Loading</div>
        <div className="text-lg font-semibold">Admission Data</div>
      </div>
    );
  }
  // {
  //   if (printInvoice) {
  //     return (
  //       <IpdInvoice
  //         printInvoice={printInvoice}
  //         setPrintInvoice={setPrintInvoice}
  //       />
  //     );
  //   }
  // }
  return (
    <div>
      <Navbar route={["IPD", "Works"]} />
      <div className="flex justify-between items-center px-2 md:px-4">
        <a href="./">
          <div className="bg-slate-800 hover:bg-slate-950 py-3 px-5 rounded-full">
            <FaCircleLeft className="size-8" />
          </div>
        </a>
        <div className="bg-slate-800 my-2 flex justify-center gap-4 py-3 w-full font-bold text-2xl rounded-full mx-auto md:w-3/4 lg:w-1/2">
          <div className="">
            Patient:{" "}
            <span className="text-blue-500">{admission.patientId.name}</span>
          </div>
          <div className="">
            UHID:{" "}
            <span className="text-blue-500">{admission.patientId.uhid}</span>
          </div>
        </div>
        <div className="px-5 md:px-10"></div>
      </div>
      <Button
        onClick={() => {
          setPrintInvoice(admission);
        }}
      >
        Print
      </Button>
      <AdmissionRecordsForm
        admission={admission}
        setAdmission={setAdmission}
        insurenceDetails={false}
      />
    </div>
  );
}

export default Page;
