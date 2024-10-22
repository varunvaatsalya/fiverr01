"use client"
import React, { useEffect, useState } from 'react'

function page({params}) {
  // const id = params.id;
  // const [submitting, setSubmitting] = useState(false);
  // const [units, setUnits] = useState([]);
  // const [message, setMessage] = useState(null);

  // useEffect(()=>{
  //   async function fetchData() {
  //     try {
  //       let result = await fetch("/api/units");
  //       result = await result.json();
  //       if (result.success) {
  //         setUnits(result.units);
  //       }
  //     } catch (err) {
  //       console.log("error: ", err);
  //     }
  //   }
  //   // fetchData();
  // },[])
  return <div className='text-3xl font-bold text-red-400'>pending</div>

  // return (
  //   <div className='bg-black min-h-screen w-full'>
  //     <div className="w-[95%] md:w-3/4 py-4 text-center bg-slate-950 px-4 rounded-xl">
  //           <form
  //             onSubmit={handleSubmit(onSubmit)}
  //             className="w-full md:w-4/5 lg:w-3/4 max-h-[80vh] overflow-auto mx-auto px-2 my-2"
  //           >
  //             {/* Department Name */}
  //             <h2 className="font-bold text-2xl text-white">
  //               Details of new <span className="text-blue-500">Test</span>
  //             </h2>
  //             <hr className="border border-slate-800 w-full my-2" />
  //             {message && (
  //               <div className="my-1 text-center text-red-500">{message}</div>
  //             )}
  //             <div className="mb-4 md:flex gap-2">
  //               <div className="w-full md:w-3/4">
  //                 <input
  //                   {...register("name", { required: true })}
  //                   type="text"
  //                   id="name"
  //                   onChange={(e) =>
  //                     (e.target.value = e.target.value.toLowerCase())
  //                   }
  //                   className="mt-1 block px-4 h-12 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
  //                   placeholder="Enter the Test Name"
  //                 />
  //                 <div className="text-sm text-gray-600 text-start">
  //                   * Department names must be typed in lowercase only.
  //                 </div>
  //               </div>
  //               <input
  //                 {...register("price", { required: true })}
  //                 type="number"
  //                 id="price"
  //                 className="mt-1 block px-4 h-12 text-white w-full md:w-1/4 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
  //                 placeholder="Price"
  //               />
  //             </div>

  //             {/* Items (item name and price) */}
  //             <div>
  //               <h3 className="font-semibold text-lg mb-2">Items</h3>
  //               {fields.length === 0 && (
  //                 <p className="text-gray-500">
  //                   No items added yet. Click <u>Add Item</u> to start.
  //                 </p>
  //               )}

  //               {fields.map((field, index) => (
  //                 <div
  //                   key={field.id}
  //                   className="flex items-center mb-4 space-x-2"
  //                 >
  //                   {/* Item Name */}
  //                   <div className="flex-1">
  //                     <input
  //                       {...register(`items[${index}].name`, {
  //                         required: true,
  //                       })}
  //                       type="text"
  //                       placeholder="Item Name"
  //                       className=" px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
  //                     />
  //                   </div>
  //                   <div className="w-1/5 min-w-24">
  //                     <input
  //                       {...register(`items[${index}].range`, {
  //                         required: true,
  //                       })}
  //                       type="text"
  //                       placeholder="Range"
  //                       className=" px-4 py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
  //                     />
  //                   </div>

  //                   {/* Price */}
  //                   <div className="w-28">
  //                     <select
  //                       {...register(`items[${index}].unit`, {
  //                         required: true,
  //                       })}
  //                       className=" px-1 text-sm py-3 text-white w-full bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
  //                     >
  //                       <option value="">Unit</option>
  //                       {units.map((unit) => {
  //                         return <option value={unit.name}>{unit.name}</option>;
  //                       })}
  //                     </select>
  //                   </div>

  //                   {/* Delete Button */}
  //                   <button
  //                     type="button"
  //                     onClick={() => remove(index)}
  //                     className="text-red-500 font-semibold hover:text-red-700"
  //                   >
  //                     Delete
  //                   </button>
  //                 </div>
  //               ))}

  //               {/* Add New Item Button */}
  //               <button
  //                 type="button"
  //                 onClick={() => append({ name: "", range: "", unit: "" })}
  //                 className="p-2 bg-blue-500 rounded-lg font-semibold text-white"
  //               >
  //                 Add Item
  //               </button>
  //             </div>

  //             {/* Submit Button */}
  //             <hr className="border border-slate-800 w-full my-2" />
  //             <div className="flex px-4 gap-3 justify-end">
  //               <button
  //                 className="p-2 border text-white border-slate-700 rounded-lg font-semibold"
  //                 onClick={() => {
  //                   setNewUserSection((prev) => !prev);
  //                 }}
  //               >
  //                 Cancel
  //               </button>
  //               <button
  //                 type="submit"
  //                 className="p-2 bg-red-500 rounded-lg font-semibold text-white"
  //                 disabled={submitting}
  //               >
  //                 {submitting ? <Loading size={15} /> : <></>}
  //                 {submitting ? "Wait..." : "Confirm"}
  //               </button>
  //             </div>
  //           </form>
  //         </div>
  //   </div>
  // )
}

export default page
