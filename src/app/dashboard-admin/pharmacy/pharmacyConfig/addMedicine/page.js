import React from 'react'
import Navbar from '../../../../components/Navbar'
import NewMedicineForm from '../../../../components/NewMedicineForm'

function Page() {
  return (
    <div>
      <Navbar route={["Medicine", "Add"]} />
      <NewMedicineForm />
    </div>
  )
}

export default Page
