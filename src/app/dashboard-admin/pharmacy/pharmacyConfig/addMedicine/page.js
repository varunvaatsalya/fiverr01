import React from 'react'
import Navbar from '@/app/components/Navbar'
import NewMedicineForm from '@/app/components/NewMedicineForm'

function Page() {
  return (
    <div>
      <Navbar route={["Medicine", "Add/Edit"]} />
      <NewMedicineForm />
    </div>
  )
}

export default Page
