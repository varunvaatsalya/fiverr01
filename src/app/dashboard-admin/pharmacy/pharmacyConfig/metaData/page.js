import React from 'react'
import Navbar from '../../../../components/Navbar'
import MedicineMetaDataForm from '../../../../components/MedicineMetaDataForm'

function page() {
  return (
    <div>
      <Navbar route={["Medicine", "Meta Data"]} />
      <MedicineMetaDataForm />
    </div>
  )
}

export default page
