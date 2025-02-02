"use client";
import React, { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

function StockOrder({ info, selectedType }) {
  const [selectedManfacturer, setSelectedManfacturer] = useState(null);
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [data, setData] = useState([]);

  async function handleGetDetails() {
    fetch(`/api/orderStock?id=${selectedManfacturer._id}`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.medicinesWithStock
          .filter(
            (element) =>
              element.totalBoxes - element.minimumStockCount.godown < 0
          )
          .map((element) => ({
            ...element,
            required: element.minimumStockCount.godown - element.totalBoxes,
          }));
        setData(filtered);
        setMessage(data.message);
        console.log(filtered);
      });
  }

  useEffect(() => {
    setData([]);
  }, [selectedType]);

  useEffect(() => {
    if (selectedManfacturer) {
      let phoneNumber =
        selectedType === "manufacturer"
          ? selectedManfacturer.medicalRepresentator?.contact
            ? selectedManfacturer.medicalRepresentator?.contact
            : ""
          : selectedManfacturer.contact
          ? selectedManfacturer.contact
          : "";
      setContact(phoneNumber);
    }
  }, [selectedManfacturer]);

  const sendWhatsAppMessage = async () => {
    let message = `Hello,

Here is the list of medicines and the required quantities:

`;

    data.forEach((medicine) => {
      message += `Medicine Name: ${medicine.name}
Required Quantity: ${medicine.required} boxes

`;
    });

    message += `Thank you`;

    const encodedMessage = encodeURIComponent(message);

    if (contact) {
      window.open(
        `https://api.whatsapp.com/send?phone=${contact}&text=${encodedMessage}`,
        "_blank"
      );
      // const isConfirmed = window.confirm(
      //   "Did the WhatsApp message send successfully?"
      // );
      // if (isConfirmed) {
      //   alert("Order recorded successfully! ✅");
      // }
      window.addEventListener(
        "focus",
        () => {
          const isConfirmed = window.confirm(
            "Did the WhatsApp message send successfully?"
          );
          if (isConfirmed) {
            alert("Order recorded successfully! ✅");
          }
        },
        { once: true }
      ); // Ensure it runs only once
    }
  };
  return (
    <div className="p-2 flex flex-col items-center">
      {message && (
        <div className="my-1 text-center text-red-500">{message}</div>
      )}
      <label
        className="block font-semibold text-gray-100 text-center capitalize"
        htmlFor="medicine"
      >
        {"Select " + selectedType}
      </label>
      <select
        id="medicine"
        onChange={(e) => {
          const Manufacturer = info.find(
            (manufacturer) => manufacturer._id === e.target.value
          );
          setSelectedManfacturer(Manufacturer);
          setData([]);
        }}
        className="mt-1 block px-4 py-3 text-white w-full md:w-3/4 mx-auto bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
      >
        <option value="">{"-- Select a " + selectedType + " --"}</option>
        {info.map((manufacturer, index) => (
          <option key={index} value={manufacturer._id}>
            {manufacturer.name}
          </option>
        ))}
      </select>
      {data.length > 0 ? (
        <>
          <div className="w-full md:w-4/5 p-2">
            <div className="bg-gray-950 font-semibold text-sm rounded-lg py-1 flex items-center p-1">
              <div className="w-[5%] text-center">Sr No.</div>
              <div className="w-[55%] text-center">Medicine</div>
              <div className="w-[15%] text-center">Min Stock Count</div>
              <div className="w-[15%] text-center">Current Stock</div>
              <div className="w-[15%] text-center">Required</div>
            </div>
            {data.map((details, index) => (
              <div key={index} className="border-b border-gray-900 font-semibold text-sm rounded-lg p-1 flex items-center">
                <div className="w-[5%] text-center">{index + 1}</div>
                <div className="w-[55%] text-center">{details.name}</div>
                <div className="w-[15%] text-center">
                  {details.minimumStockCount.godown}
                </div>
                <div className="w-[15%] text-center">{details.totalBoxes}</div>
                <div className="w-[15%] text-center">
                  <input
                    type="number"
                    value={details.required}
                    className="w-20 text-sm text-gray-100 bg-gray-900 outline-none focus:ring-1 ring-gray-700 rounded-lg py-1 px-2"
                    onChange={(e) => {
                      const updatedData = [...data];
                      updatedData[index].required = Number(e.target.value);
                      setData(updatedData);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="font-semibold">
            {"Send Message to " +
              (selectedType === "manufacturer" ? "MR" : "Vendor")}
          </div>
          <button
            onClick={sendWhatsAppMessage}
            disabled={!contact}
            className="px-3 py-2 font-semibold rounded-lg bg-green-600 text-white my-2 mx-auto flex gap-2"
          >
            <FaWhatsapp className="size-6" />
            <div>Whatsapp</div>
          </button>
        </>
      ) : (
        <button
          onClick={handleGetDetails}
          disabled={!selectedManfacturer}
          className="px-3 py-2 font-semibold rounded-lg bg-sky-600 my-2 mx-auto"
        >
          Get Details
        </button>
      )}
    </div>
  );
}

export default StockOrder;
