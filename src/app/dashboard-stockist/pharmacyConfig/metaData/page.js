import React from 'react'
import Navbar from '@/app/components/Navbar'
import MedicineMetaDataForm from '@/app/components/MedicineMetaDataForm'

function Page() {
  return (
    <div>
      <Navbar route={["Medicine", "Meta Data"]} />
      <MedicineMetaDataForm />
    </div>
  )
}

export default Page
