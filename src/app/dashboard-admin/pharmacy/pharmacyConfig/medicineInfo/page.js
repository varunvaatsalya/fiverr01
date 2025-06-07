"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../../../components/Navbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function Page() {
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch(`/api/medicinesInfo?letter=${selectedLetter}`);
        result = await result.json();
        if (result.success) {
          setData(result.info);
          setFilteredData(result.info);
        } else {
          setMessage(result.message);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, [selectedLetter]);


  function searchQuery(query) {
  let searched = data.filter((item) =>
    item.medicine.name.toLowerCase().includes(query.toLowerCase())
  );
  setFilteredData(searched);
}

  return (
    <div className="flex flex-col h-screen min-h-screen">
      <Navbar route={["Pharmcy", "Config", "Info"]} />
      <div className="w-full my-1 flex justify-around flex-wrap items-center gap-4">
        <input
          type="text"
          onChange={(e) => searchQuery(e.target.value)}
          className="px-2 py-0.5 w-1/4 rounded-lg bg-gray-300 text-gray-900 focus:outline-none"
          placeholder="Search"
        />
        <div className="flex gap-1 jusitfy-center">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => {
            return (
              <button
                key={letter}
                onClick={() => {
                  setSelectedLetter(letter);
                }}
                className={
                  "w-8 text-sm aspect-square border border-gray-900 text-black hover:bg-gray-800 hover:text-gray-100 rounded flex justify-center items-center" +
                  (selectedLetter === letter
                    ? " bg-gray-800 text-gray-100"
                    : "")
                }
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 w-full text-black">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Packet Size</TableHead>
              <TableHead>Retail Boxes</TableHead>
              <TableHead>Retail Strips</TableHead>
              <TableHead>Retail Tablets</TableHead>
              <TableHead>Retail Extras</TableHead>
              <TableHead>Godown Boxes</TableHead>
              <TableHead>Godown Strips</TableHead>
              <TableHead>Godown Extras</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item, idx) => {
              const { medicine, retailStock, godownStock } = item;
              const packetSizeText = medicine.isTablets
                ? `${medicine.packetSize.strips} x ${medicine.packetSize.tabletsPerStrip} tablets`
                : `${medicine.packetSize.strips} units`;

              return (
                <TableRow key={idx}>
                  <TableCell>{medicine.name}</TableCell>
                  <TableCell>{packetSizeText}</TableCell>

                  <TableCell>{retailStock.totalBoxes}</TableCell>
                  <TableCell>{retailStock.totalStrips}</TableCell>
                  <TableCell>
                    {medicine.isTablets ? retailStock.totalTablets : "-"}
                  </TableCell>
                  <TableCell>{retailStock.totalExtras}</TableCell>

                  <TableCell>{godownStock.totalBoxes}</TableCell>
                  <TableCell>{godownStock.totalStrips}</TableCell>
                  <TableCell>{godownStock.totalExtras}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default Page;
