"use client"
import React, { useRef } from 'react';

import Invoice from '../../components/Invoice';

const Page = () => {
  const patientData = {
    name: 'John Doe',
    uhid: '1234567890',
  };

  const doctorData = {
    name: 'Dr. Varun Gupta',
  };

  const departmentData = {
    name: 'Neurology',
  };

  const prescriptionData = {
    items: [
      { name: 'X-ray', price: 125 },
      { name: 'CT Scan', price: 250 },
    ],
  };

  return (
    <div>
      <Invoice
        patient={patientData}
        prescription={prescriptionData}
        doctor={doctorData}
        department={departmentData}
      />
    </div>
  );
};

export default Page;







// const Invoice = ({ patient, prescription, doctor, department }) => {
//   const componentRef = useRef();

// //   const handlePrint = () => {
// //     window.print();
// //   };
  

//   return (
//     <div>
//       <div ref={componentRef} className="invoice-container">
//         <div className="invoice-header">
//           <h1>Medical Invoice</h1>
//           <p>Generated on: {new Date().toLocaleDateString()}</p>
//         </div>

//         <div className="invoice-details">
//           <h2>Patient Information</h2>
//           <p><strong>Name:</strong> {patient.name}</p>
//           <p><strong>UHID:</strong> {patient.uhid}</p>

//           <h2>Prescription Details</h2>
//           <table className="invoice-table">
//             <thead>
//               <tr>
//                 <th>Item</th>
//                 <th>Price (₹)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {prescription.items.map((item, index) => (
//                 <tr key={index}>
//                   <td>{item.name}</td>
//                   <td>{item.price}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <h2>Doctor Information</h2>
//           <p><strong>Doctor:</strong> {doctor.name}</p>
//           <p><strong>Department:</strong> {department.name}</p>
//         </div>

//         <div className="invoice-footer">
//           <h3>Total: ₹{prescription.items.reduce((acc, item) => acc + item.price, 0)}</h3>
//         </div>
//       </div>

//       <button onClick={handlePrint} className="print-btn">Print Invoice</button>

//       <style jsx>{`
//         .invoice-container {
//           max-width: 800px;
//           margin: 20px auto;
//           padding: 20px;
//           border: 1px solid #ddd;
//           font-family: Arial, sans-serif;
//           background-color: #fff;
//         }
//         .invoice-header {
//           text-align: center;
//           margin-bottom: 20px;
//         }
//         .invoice-details h2 {
//           margin-bottom: 10px;
//           color: #333;
//         }
//         .invoice-table {
//           width: 100%;
//           border-collapse: collapse;
//         }
//         .invoice-table th, .invoice-table td {
//           border: 1px solid #ddd;
//           padding: 8px;
//           text-align: left;
//         }
//         .invoice-footer {
//           margin-top: 20px;
//           text-align: right;
//           font-weight: bold;
//         }
//         .print-btn {
//           margin-top: 20px;
//           padding: 10px 20px;
//           background-color: #4CAF50;
//           color: white;
//           border: none;
//           cursor: pointer;
//           display: block;
//           margin-left: auto;
//           margin-right: auto;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Invoice;
