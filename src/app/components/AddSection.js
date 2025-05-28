function AddSection({
  setNewUserSection,
  deleteDataEntry,
  setEntity,
  FormComponent,
  prescriptions,
  editPatient,
  setEditPatient,
  editPrescription,
  setEditPrescription,
  setPrintPrescription,
  expressData,
  setExpressData,
  editDoctor,
  setEditDoctor,
  EditReportForm,
  editReport,
}) {
  return (
    <div className="absolute top-0 left-0">
      <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
        <div className="w-[95%] md:w-4/5 lg:w-3/4 py-4 text-center bg-slate-950 px-4 rounded-xl">
          <FormComponent
            setNewUserSection={setNewUserSection}
            deleteDataEntry={deleteDataEntry}
            setEntity={setEntity}
            prescriptions={prescriptions}
            editPatient={editPatient}
            editReport={editReport}
            EditReportForm={EditReportForm}
            setPrintPrescription={setPrintPrescription}
            setEditPatient={setEditPatient}
            editPrescription={editPrescription}
            expressData={expressData}
            setExpressData={setExpressData}
            setEditPrescription={setEditPrescription}
            editDoctor={editDoctor}
            setEditDoctor={setEditDoctor}
          />
        </div>
      </div>
    </div>
  );
}

export default AddSection;
