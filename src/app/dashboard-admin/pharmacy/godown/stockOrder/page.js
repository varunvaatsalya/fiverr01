import Navbar from '../../../../components/Navbar'
import React from 'react'

function Page() {
  return (
    <div className='bg-slate-800 min-h-screen w-full'>
      <Navbar route={["Pharmacy", "Stock Order"]} />
      
    </div>
  )
}

export default Page
