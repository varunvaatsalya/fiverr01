function AddSection({
  setNewUserSection,
  setEntity,
  FormComponent,
  prescriptions,
  editPatient,
  setEditPatient,
  editPrescription,
  setEditPrescription,
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
            setEntity={setEntity}
            prescriptions={prescriptions}
            editPatient={editPatient}
            editReport={editReport}
            EditReportForm={EditReportForm}
            setEditPatient={setEditPatient}
            editPrescription={editPrescription}
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
