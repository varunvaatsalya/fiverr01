import React from 'react'
import Navbar from '../../../../components/Navbar'
import MedicineMetaDataForm from '../../../../components/MedicineMetaDataForm'

function Page() {
  return (
    <div>
      <Navbar route={["Medicine", "Meta Data"]} />
      <MedicineMetaDataForm />
    </div>
  )
}

export default Page
