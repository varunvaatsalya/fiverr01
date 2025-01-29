import React from 'react'
import NewPharmacyInvoice from "../../../components/NewPharmacyInvoice";
import Navbar from '../../../components/Navbar';
function Page() {
  return (
    <div className='bg-gray-950 min-h-screen'>
      <Navbar route={["Pharmacy", "Add"]} />
      <NewPharmacyInvoice />
    </div>
  )
}

export default Page
