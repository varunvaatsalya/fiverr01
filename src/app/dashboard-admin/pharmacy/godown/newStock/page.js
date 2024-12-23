"use client";
import React, { useEffect, useState } from 'react'
import Navbar from '../../../../components/Navbar';
import NewStockForm from '../../../../components/NewStockForm';

// const medicines = [
//   {
//     _id:'1',
//     defaultSellingPrice: "45",
//     manufacturer: "hgscvdjw",
//     name: "wcd",
//     packetSize: { tabletsPerStrip: "14", strips: "52" },
//     salts: "ayush gupta - 25498756",
//   },
//   {
//     _id:'2',
//     defaultSellingPrice: "52",
//     manufacturer: "hgscvdjw",
//     name: "wcd",
//     packetSize: { tabletsPerStrip: "25", strips: "20" },
//     salts: "ayush gupta - 25498756",
//   },
//   {
//     _id:'3',
//     defaultSellingPrice: "76",
//     manufacturer: "hgscvdjw",
//     name: "wcd",
//     packetSize: { tabletsPerStrip: "20", strips: "12" },
//     salts: "ayush gupta - 25498756",
//   },
//   {
//     _id:'4',
//     defaultSellingPrice: "85",
//     manufacturer: "hgscvdjw",
//     name: "wcd",
//     packetSize: { tabletsPerStrip: "16", strips: "12" },
//     salts: "ayush gupta - 25498756",
//   },
// ];

function page() {
  const [medicines, setMedicines] = useState([]);
  
    useEffect(() => {
      fetch("/api/newMedicine?basicInfo=1")
        .then((res) => res.json())
        .then((data) => {
          setMedicines(data.response);
          console.log(data.response);
        });
    }, []);
  return (
    <div>
      <Navbar route={["Pharmacy", "GoDown", "New Stock"]} />
      <NewStockForm medicines={medicines} />
    </div>
  )
}

export default page
