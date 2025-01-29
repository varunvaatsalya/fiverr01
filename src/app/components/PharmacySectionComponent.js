// PharmacySectionComponent
function PharmacySectionComponent({
  setNewInvoiceSection,
  setInvoices,
  FormComponent,
  editInvoice,
  setEditInvoice,
}) {
  return (
    <div className="absolute top-0 left-0">
      <div className="fixed w-screen h-screen bg-gray-700/[.5] z-30 flex justify-center items-center">
        <div className="w-[95%] md:w-4/5 lg:w-3/4 py-4 max-h-[85vh] overflow-y-auto text-center bg-slate-950 px-4 rounded-xl">
          <FormComponent
            setNewInvoiceSection={setNewInvoiceSection}
            setInvoices={setInvoices}
            editInvoice={editInvoice}
            setEditInvoice={setEditInvoice}
          />
        </div>
      </div>
    </div>
  );
}

export default PharmacySectionComponent;
