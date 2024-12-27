import React from 'react'
import Navbar from '../../../../components/Navbar'
import AddMedicineForm from '../../../../components/AddMedicineForm'

function Page() {
  return (
    <div>
      <Navbar route={["Medicine", "Add"]} />
      <AddMedicineForm />
    </div>
  )
}

export default Page
